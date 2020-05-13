const crypto = require('crypto');

exports.challengeValidator = function (event, context) {
    if (!event.salt || event.salt.length < 5) {
        return context.fail("Invalid salt");
    }

    let challengeId = "red_ch3";
    
    if(event.team==="blue"){
        challengeId = "blue_ch3";
    }

    let masterSalt;

    if (process.env.CHALLENGE_MASTER_SALT) {
        masterSalt = process.env.CHALLENGE_MASTER_SALT;
    } else {
        context.fail("Expected CHALLENGE_MASTER_SALT env variable to be set.");
    }

    var verificationHash = crypto.createHash('sha256').update(challengeId + event.salt + masterSalt).digest('base64');

    return context.succeed({
        verificationCode: verificationHash
    });
}

