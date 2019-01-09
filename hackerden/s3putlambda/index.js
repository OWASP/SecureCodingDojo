var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const JSEncrypt = require('node-jsencrypt');
const util = require('util');
const crypto = require('crypto');
var s3 = new AWS.S3();
 
exports.handler = function(event, context, callback) {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    var srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey    =
    decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));  
    if(srcKey === 'messages.json'){
        //ignore put requests for self
        return context.succeed("self request");
    }
    var curObject = null;
    var messages = null;
    var challengeCodeUrl = null;

    var lambda = new AWS.Lambda();
        lambda.invoke({
            FunctionName:'FoobarChallengeSign',
            Payload: JSON.stringify({challengeId:"nptqRb99a5E"})
        },
    function(error,data){
        if(error){
            context.fail("Failed to call challenge signer");
        }
        else{
            challengeCodeUrl = JSON.parse(data.Payload).challengeCodeUrl;     
            console.log(challengeCodeUrl);
            exports.processS3Put(challengeCodeUrl, context, srcBucket, srcKey);     
        }
    }); 
    
};


exports.processS3Put = function(challengeCodeUrl, context, srcBucket, srcKey){
    s3.getObject({
        Bucket: 'foobarcampaign-messages',
        Key: 'messages.json'
    },
    function downloadObject(err,response) {
        if(err){
            return context.fail(err);
        }
        var messages = JSON.parse(response.Body.toString('utf-8'));

        // Download the file from S3 into a buffer.
        s3.getObject({
            Bucket: srcBucket,
            Key: srcKey
        },
        function upload(err,response) {
            if(err){
                return context.fail(err);
            }
            
            try{
                var curObject;
                if(response.ContentType==='application/json'){
                    curObject = JSON.parse(response.Body.toString('utf-8'));
                }
                else{
                    curObject = response.Body.toString('utf-8');
                }
    
                if(curObject.type==='encMessage'){
                    curObject = exports.validateCurrentObject(curObject, challengeCodeUrl);
                }
    
                if(curObject.type==='userMessage'|| curObject.type==='encMessage'){
                    messages.push(curObject);
                }
                else{
                    messages.push({
                        "type":"botMessage",
                        "date": new Date().toLocaleString(),
                        "message":"A new bot was added: "+curObject
                    })
                }
            
                //delete the message from S3 since it's been saved in the messages.json
                s3.deleteObject({
                            Bucket: srcBucket,
                            Key: srcKey
                        },
                function(err, data) {
                   if (err) console.log(err, err.stack); // an error occurred
                
                });
                
                s3.putObject({
                        Bucket: 'foobarcampaign-messages',
                        Key: 'messages.json',
                        Body: JSON.stringify(messages),
                        ContentType: 'application/json'
                    },
                function(err,data){
                    if(err){
                        context.fail(err);
                    }
                    else{
                        context.succeed(data);
                    }
                });
            }
            catch(err){
                context.fail(err.message);
            }
        });
    });
}

exports.validateCurrentObject = function(curObject, challengeCodeUrl){
    //check integrity
    var toHash = "<img src='https://gov.logger.good' width='0px'>"+curObject.pubKey;
    var hash = crypto.createHash('sha256').update(toHash).digest('hex');

    if(curObject.integrity===hash){
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(curObject.pubKey);
        var re = new RegExp('.{1,40}', 'g');
        var challengeCodeUrlParts = challengeCodeUrl.match(re);
        var encChallengeCodeUrlParts = [];
        challengeCodeUrlParts.forEach(part => {
            encChallengeCodeUrlParts.push(encrypt.encrypt(part));
        });
        curObject.challengeCodeUrl = encChallengeCodeUrlParts;
        curObject.nextChallenge = encrypt.encrypt(process.env.NEXT_CHALLENGE);
    }
    else{
        curObject.error = "Integrity check failed for:'"+JSON.stringify(curObject)+"'";
    }
    return curObject;
}


