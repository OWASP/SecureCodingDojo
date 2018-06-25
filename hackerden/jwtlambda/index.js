const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const https = require('https');
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});


exports.foobarAuthorizer = function(event, context) {
  var authToken = event.headers.Authorization;
  if(typeof authToken === 'undefined'){
    authToken = event.headers.authorization;
  }
  
  if(authToken && authToken.split(' ')[0] === 'Bearer') {
    var idToken = authToken.split(' ')[1];
    var currentTime = Math.floor(Date.now() / 1000);
    jwt.verify(idToken, process.env.AUTHORIZER_SECRET, function(err, decoded) {
      if (err) {
        console.log('failed jwt verify: ', err, 'auth: ', idToken);
        return context.succeed(generatePolicy(null, 'Deny', event.methodArn));
      } else {
        console.log('authorized:', decoded);
        var action = "Deny"
        //some methods are public
        if(event.methodArn.indexOf("GET/foobarcampaign-messages/currentuser")>-1){
          action="Allow";
        }
        
        //handle updates
        if(event.methodArn.indexOf("PUT/foobarcampaign-messages")>-1){
          if(event.path.endsWith(".mes")) action="Allow";
        }
        else if(decoded.sub==="badspaghetti" || decoded.sub==="stinkyfish"){
          action="Allow";
        }
        
        return context.succeed(generatePolicy(decoded.sub, action, event.methodArn));
      }
    });
  } else {
    console.log('invalid authorization token or header', authToken);
    return context.succeed(generatePolicy(null, 'Deny', event.methodArn));
  }
};

exports.foobarAuth = function(event, context) {
  https.get(process.env.CHAT_USERS_FILE, (resp) => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
          var users = JSON.parse(data);
          var user = users[event.userName]; //get the user entry from the db
          var userPassHash = user.passHash;
          var vfHash = crypto.createHash('sha1').update(event.userPass).digest('hex');
          if(userPassHash===vfHash){
            //generate JWT to identify this user
            var token = jwt.sign({"sub": event.userName,"name": user.name}, process.env.AUTHORIZER_SECRET);
            context.succeed({"token": token});
          }
          else{
            context.fail("Invalid credentials");
          }
      });

    }).on("error", (err) => {
      context.fail(err.message);
    });
}

exports.foobarGetCurrentUser = function(event, context) {
  //validate the token 
  var token = event.headers.Authorization.split(' ')[1];

  jwt.verify(token, process.env.AUTHORIZER_SECRET, function(err, decoded) {
    if (err) {
      console.log('Failed jwt verify');
      return context.fail("Invalid or expired token");
    } else {
      console.log('authorized:', decoded);
      var response = {id:decoded.sub,name:decoded.name};
      if(decoded.sub==="test"){
        //for the text user add the challenge code url
        var lambda = new AWS.Lambda();
        lambda.invoke({
            FunctionName:'FoobarChallengeSign',
            Payload: JSON.stringify({challengeId:"ID6Qzz3Q"})
        },function(error,data){
           if(error){
             context.fail("Failed to call challenge signer");
           }
           else{
             
              response.challengeCodeUrl = JSON.parse(data.Payload).challengeCodeUrl;
              console.log(response);
              context.succeed(response);
           }
        }); 
      }
    }
  });
}


//issue challenge tokens and redirect to challenge code signer
exports.challengeSigner = function(event,context){
  console.log(event);
  var challengeId = event.challengeId;
  var token = jwt.sign({"sub": challengeId}, process.env.SIGNER_SECRET, {expiresIn:5*60});
  context.succeed({"message":"YOU GOT IT!","challengeCodeUrl":process.env.CHALLENGE_CODE_URL+"#"+token, "challengeId":challengeId});
}

//validate challenge tokens and issue challenge codes
exports.challengeValidator = function(event,context){
  //validate the token 
  jwt.verify(event.token, process.env.SIGNER_SECRET, function(err, decoded) {
    if (err) {
      console.log('Failed jwt verify');
      return context.fail("Invalid or expired token");
    } else {
      console.log('authorized:', decoded);
      var challengeId = decoded.sub;
      var challengeCode = null;
      switch(challengeId){
        case "dg5RbyYo" : challengeCode = process.env.CHALLENGE_CODE1; break;
        case "ID6Qzz3Q":  challengeCode = process.env.CHALLENGE_CODE2; break;
      }
      
      if(challengeCode===null){
        return context.fail("Invalid challenge code");
      }

      if(!event.codeSalt || event.codeSalt.length < 5){
        return context.fail("Invalid salt");
      }

      var verificationHash = crypto.createHash('sha256').update(challengeCode+event.codeSalt).digest('base64');

      return context.succeed({
        verificationCode:verificationHash
      });
    }
  });
}



var generatePolicy = function(principalId, effect, resource) {
    var authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        var policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        var statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};

/*
var event={
  "userName": "test",
  "userPass":"test"
};

var context = {};
context.fail=function(message){
  console.log(message);
}
context.succeed = context.fail;


console.log(exports.foobarAuth(event,context));
*/