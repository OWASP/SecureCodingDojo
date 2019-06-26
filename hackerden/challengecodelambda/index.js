const jwt = require('jsonwebtoken');
const crypto = require('crypto');


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
      
      if(challengeId===null || typeof challengeId==='undefined'){
        return context.fail("Invalid challenge id");
      }

      if(!event.codeSalt || event.codeSalt.length < 5){
        return context.fail("Invalid salt");
      }

      var masterSalt = "";
      if(process.env.CHALLENGE_MASTER_SALT){
          masterSalt=process.env.CHALLENGE_MASTER_SALT;
      }

      var verificationHash = crypto.createHash('sha256').update(challengeId+event.codeSalt+masterSalt).digest('base64');

      return context.succeed({
        verificationCode:verificationHash
      });
    }
  });
}

