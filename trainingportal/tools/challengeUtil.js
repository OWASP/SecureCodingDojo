const path = require('path');
const db = require('../db');
const challenges = require('../challenges');


var passChallenges = async (moduleId, user, except) => {
    const modulePath = path.join(__dirname,'../static/lessons',moduleId,"definitions.json");
    const moduleDefs = require(modulePath);
    for(let level of moduleDefs){
        for(var ch of level.challenges){
            let excepted = except &&  except.find(exChId => exChId === ch.id);
            if(!excepted) await db.getPromise(db.insertChallengeEntry,[user.id, ch.id]);
        }
    }
    await challenges.verifyModuleCompletion(user, moduleId);
};

module.exports = {passChallenges};