/* 
    Copyright 2023 VMware, Inc.
    SPDX-License-Identifier: Apache-2.0	
*/
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const HDEN_SIGN_SECRET = crypto.randomBytes(64).toString("hex")

//issue challenge tokens and redirect to challenge code signer
getChallengeUrl = async(challengeId) => {
    var token = await jwt.sign({"sub": challengeId}, HDEN_SIGN_SECRET, {expiresIn:15*60});
    return {"message":"YOU GOT IT!","challengeCodeUrl":"/code/getCode.html#"+token, "challengeId":challengeId};
}

validate = async(req,resp) => {
    //validate the token 
    try {
        let decoded = await jwt.verify(req.body.token, HDEN_SIGN_SECRET)
        console.log('authorized:', decoded);
        var challengeId = decoded.sub;
        
        if(challengeId===null || typeof challengeId==='undefined'){
            resp.status(400)
            return resp.send({"errorMessage":"Invalid challenge id"});
        }

        if(!req.body.codeSalt || req.body.codeSalt.length < 5){
            return resp.send({"errorMessage":"Invalid salt"});
        }

        var masterSalt = "";
        if(process.env.CHALLENGE_MASTER_SALT){
            masterSalt=process.env.CHALLENGE_MASTER_SALT;
        }

        var verificationHash = crypto.createHash('sha256').update(challengeId+req.body.codeSalt+masterSalt).digest('base64');

        return resp.send({
            "verificationCode":verificationHash
        });

    } catch (error) {
        console.log('Failed challenge code JWT verify');
        return resp.send({"errorMessage":"Invalid or expired token"});
    }

}
  
  

module.exports = {
    getChallengeUrl,
    validate
}