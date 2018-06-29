var SSH = require('simple-ssh');
const jwt = require('jsonwebtoken');


exports.handler = (event, context, callback) => {
    var ssh = new SSH({
        host: process.env.FOOBAR_SSH_HOST,
        user: 'lambda',
        pass: process.env.FOOBAR_SSH_PASS
    });

    if(typeof event.hostname === 'undefined'){
        return context.fail("Malformed JSON. Missing hostname.");
    }
    if(event.hostname.indexOf("passwd") > -1||
       event.hostname.indexOf("xxd") > -1||
       event.hostname.indexOf("echo") > -1||
       event.hostname.indexOf("tomcat") > -1||
       event.hostname.indexOf("base64") > -1||
       event.hostname.indexOf("rm ") > -1||
       event.hostname.indexOf("chmod  ") > -1||
       event.hostname.indexOf("mv ") > -1){
        return context.fail("CLEVER!. Not allowed :)");
    }
    
   
    ssh.on('error', function(err) {
        console.log('Oops, something went wrong.');
        console.log(err);
        ssh.end();
        return context.fail(err);
    });
    
    console.log("Trying to connect to ec2 instance:'"+process.env.FOOBAR_SSH_HOST+"'");
     
    ssh
    .exec('rm -f *')
    .exec('echo '+process.env.SECRET1+' > secret.txt')
    .exec('echo "curl '+process.env.COMMAND_PROC_URL+' -i -L" > connecttocommandproc.sh')
    .exec('ping -c 1 '+event.hostname, {
        out: function(stdout) {
           console.log("Got response:"+stdout);
           var resp = stdout.trim();
           
           var challengeId = null;
           var secret = null;
           if(resp.indexOf(process.env.SECRET1) > -1){
               challengeId="RpOGG3CGz";
               secret=process.env.SECRET1;
           }
           if(resp.indexOf(process.env.SECRET2) >-1){
               challengeId="dQDYI7p7he";
               secret=process.env.SECRET2;
           }
           if(resp.indexOf(process.env.SECRET3) >-1){
               challengeId="utuwHk41j";
               secret=process.env.SECRET3;
           }
           
           if(challengeId!==null){
                console.log("Getting challenge code");
                var token = jwt.sign({"sub": challengeId}, process.env.SIGNER_SECRET, {expiresIn:5*60});
                var challengeCodeUrl=process.env.CHALLENGE_CODE_URL+"#"+token;
                resp = resp.replace(secret,challengeCodeUrl);
                //remobve all secrets from response
                resp = resp.replace(process.env.SECRET1,"");
                resp = resp.replace(process.env.SECRET2,"");
                resp = resp.replace(process.env.SECRET3,"");
                context.succeed(resp);
           }
           else{
                console.log("Did not pass challenge yet");
                context.succeed(resp);
           }
           ssh.end();
        }
    })
    .start();
    
};

