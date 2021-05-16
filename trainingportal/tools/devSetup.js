const db = require("../db");
const util = require("../util");
const auth = require("../auth");
const challengeUtil = require("./challengeUtil");

async function setup(){
    try {
        util.log("Initializing database");
        await db.init();
        

        util.log("Registering local user 'dojouser' with password: 'SecureCodingDojo'");
        //cleanup the account if it exists
        await db.getConn().queryPromise("DELETE FROM users WHERE accountId = 'Local_dojouser'");
        //create the dev account
        let dojoUserInfo = {accountId:"Local_dojouser",familyName:"User", givenName:"Dojo"};
        await db.getPromise(db.insertUser, dojoUserInfo);
        auth.createUpdateUserInternal("dojouser", dojoUserInfo, "SecureCodingDojo");

        util.log("Unlocking all challenges for 'dojouser'");
        let user = await db.getPromise(db.getUser,"Local_dojouser");
        await challengeUtil.passChallenges("securityCodeReviewMaster",user,["codereview101_indirectReferences"]);
        await challengeUtil.passChallenges("blackBelt",user,["cwe502"]);

    } catch (error) {
        console.error(error);
    }

}

setup();