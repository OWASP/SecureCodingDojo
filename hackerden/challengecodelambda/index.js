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
      var challengeCode = null;
      switch(challengeId){
        case "dg5RbyYo" : challengeCode = process.env.CHALLENGE_CODE1; break;
        case "ID6Qzz3Q":  challengeCode = process.env.CHALLENGE_CODE2; break;
        case "MHU8IvrweQ": challengeCode = process.env.CHALLENGE_CODE3; break;
        case "nptqRb99a5E": challengeCode = process.env.CHALLENGE_CODE4; break;
        case "RpOGG3CGz": challengeCode = process.env.CHALLENGE_CODE5; break;
        case "dQDYI7p7he": challengeCode = process.env.CHALLENGE_CODE6; break;
        case "utuwHk41j": challengeCode = process.env.CHALLENGE_CODE7; break;
      }
      console.log(challengeCode);
      
      if(challengeCode===null || typeof challengeCode==='undefined'){
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

