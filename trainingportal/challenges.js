/**

Copyright 2017-2018 Trend Micro

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 */
const path = require('path');
const fs = require('fs');
const markdown = require('markdown').markdown;
const util = require(path.join(__dirname, 'util'));
const challengeDefinitions = Object.freeze(require(path.join(__dirname, 'static/challenges/challengeDefinitions.json')));
const challengeSecrets = Object.freeze(require(path.join(__dirname, 'challengeSecrets.json')));
const config = require(path.join(__dirname, 'config'));
const db = require(path.join(__dirname, 'db'));
const async = require('async');
const validator = require('validator');
const crypto = require('crypto');
const aescrypto = require(path.join(__dirname, 'aescrypto'));
const https = require('https');


var challengeNames = [];
var solutions = [];
challengeDefinitions.forEach(function(level){
  level.challenges.forEach(function(challenge){
    challengeNames[challenge.id] = challenge.name;
    solutions[challenge.id] = challenge.solution;
  })
});

exports.getChallengeNames = function(){ return challengeNames; }
exports.getChallengeDefinitions = function(){ return challengeDefinitions; }
exports.getChallengeSecrets = function(){ return challengeSecrets; }

/**
 * Construct the challenge definitions loaded on the client side based on the users level
 * @param {The session user object} user 
 */
exports.getChallengeDefinitionsForUser = function (user) {
    var returnChallenges = [];
    var permittedLevel = user.level + 1;
    challengeDefinitions.forEach(function (level) {
        if (permittedLevel >= level.level) {
            level.challenges.forEach(function (challenge) {
                //update the play link if it exists
                if (!util.isNullOrUndefined(config.playLinks)) {
                    var playLink = config.playLinks[challenge.id];
                    if (!util.isNullOrUndefined(playLink)) {
                        challenge.playLink = playLink;
                    }
                }
            });
            returnChallenges.push(level);
        }
        else {
            returnChallenges.push({ "level": level.level, "name": level.name, "challenges": [] });
        }
    });
    return returnChallenges;
}

/**
 * Returns the solution html (converted from markdown)
 * @param {The challenge id} challengeId 
 */
exports.getSolution = function (challengeId) {
    var solution = solutions[challengeId];
    var solutionHtml = "";
    if(!util.isNullOrUndefined(solution)){
        var solutionMarkDown = fs.readFileSync(path.join(__dirname, solution),'utf8');
        solutionHtml = markdown.toHTML(solutionMarkDown);
    }

    return solutionHtml;
}

/**
 * Checks if the user should level up and execute level up. Passes the result, true or false to the cb
 */
exports.verifyLevelUp = function(user, errCb, doneCb){
    var level = user.level !== null ? user.level+1 : 1;
    async.waterfall([
        function(cb){
            db.fetchChallengeEntriesForUser(user,
                function(err){
                    util.log("Failed to fetch challenges for level up.", user);
                    cb(err);
                },
                function(entries){
                    cb(null,entries);
                });
        },
        function(entries,cb){
            if(entries!=null && entries.length>0 && challengeDefinitions.length > level) {
                //get challenges for current user level
                var challengeDefForLevel = challengeDefinitions[level].challenges;
                //check whether the entries match the level challenges
                var passCount = 0;
                challengeDefForLevel.forEach(function(challengeDef){
                    entries.forEach(function(entry){
                        if(entry.challengeId===challengeDef.id){
                            passCount++;
                        }
                    });
                });
                cb(null, passCount === challengeDefForLevel.length);
            }
            else{
                cb(null,false);
            }
        },
        function(shouldLevelUp,cb){
            if(shouldLevelUp){
                user.level = level;
                db.updateUser(user,
                    function(err){
                        util.log("Failed to update user for level up.", user);
                        cb(err);
                    },
                    function(result){
                        doneCb(true);
                    });
            }
            else{
                doneCb(false);
            }
        }
    ],function(err){
        errCb(err);
    });

}

/**
 * Issue a badge for achieving a level
 * @param {*} badgrInfo 
 * @param {*} user 
 */
module.exports.badgrCall = function(badgrInfo, user){
    if(!util.isNullOrUndefined(badgrInfo) && !util.isNullOrUndefined(config.encBadgrToken)){
      if(user.email===null){
        util.log("Cannot issue badge for this user. E-mail is null.", user);
      }
      else{
        var token = aescrypto.decrypt(config.encBadgrToken);
        badgrInfo.recipient_identifier = user.email;
        badgrInfo.narrative+=" Awarded to "+user.givenName+" "+user.familyName+".";
        var postData = JSON.stringify(badgrInfo);
        var postOptions = {
          host: 'api.badgr.io',
          port: '443',
          path: '/v1/issuer/issuers/'+badgrInfo.issuer+'/badges/'+badgrInfo.badge_class+'/assertions',
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
              'Authorization':'Token '+token
          }
        
        }
  
        // Set up the request
        var postReq = https.request(postOptions, function(res) {
            if(res!==null && !util.isNullOrUndefined(res.statusCode) && res.statusCode === 201){
              util.log("Badgr Open Badge issued successfully.");
            }
            else{
              util.log("Badgr Open Badge could not be issued.");
            } 
        });
  
        // post the data
        postReq.write(postData);
        postReq.end();
      }
    }
}

/** 
 * Logic to for the api challenge code
 */
module.exports.apiChallengeCode = (req, cb) => {
    if(util.isNullOrUndefined(req.body.challengeId) || 
        util.isNullOrUndefined(req.body.challengeCode)){
        return cb({code:"invalidRequest"});
    }
  
    var challengeId = req.body.challengeId.trim();
    var challengeCode = req.body.challengeCode.trim();

    if(util.isNullOrUndefined(challengeCode) || validator.isBase64(challengeCode) == false){
        return cb({code:"invalidCode"});
    }

    if(util.isNullOrUndefined(challengeId) || validator.isAlphanumeric(challengeId) == false){
        return cb({code:"invalidId"});
    }

    //check id
    var availableChallenges = null;
    var curChallengeObj = null;
    var userLevel = req.user.level+1;
    if(req.user.level === null) req.user.level = 0;

    //identify the current challenge object and also the available challenges for the current user level
    var challengeDefinitions = module.exports.getChallengeDefinitions();
    for(var idx=0;idx<challengeDefinitions.length;idx++){
        var levelObj = challengeDefinitions[idx];
        var levelChallenges = levelObj.challenges;
        if(levelObj.level===userLevel){
            availableChallenges = levelChallenges;
        }
    }

    if(availableChallenges==null || availableChallenges.length==0){ 
        return cb({code:"wrongLevel"});
    }

    //search for the current challenge id
    for(var cIdx=0; cIdx<availableChallenges.length; cIdx++){
        if(challengeId === availableChallenges[cIdx].id){
            curChallengeObj = availableChallenges[cIdx];
            break;
        }
    }

    if(curChallengeObj==null){
        return cb({code:"challengeNotFound"});
    }
    var challengeSecrets = module.exports.getChallengeSecrets();
    var secretEntry = challengeSecrets[challengeId];
    
    if(secretEntry===null){
        return cb({code:"challengeSecretNotFound"});

    } 

    if(util.hasKey()){
        secretEntry = aescrypto.decrypt(secretEntry,process.env.CHALLENGE_KEY,process.env.CHALLENGE_KEY_IV);
    }
    //calculate the hash
    var verificationHash = crypto.createHash('sha256').update(secretEntry+req.user.codeSalt).digest('base64');
    if(verificationHash!==challengeCode){
        return cb({code:"invalidCode"});
    } 
    //success update challenge
    db.insertChallengeEntry(req.user.id,challengeId,
    function(){
        return cb({code:"Code save error"});
    },function(){
            //issue badgr badge if enabled
            module.exports.badgrCall(curChallengeObj.badgrInfo,req.user);
            //check to see if the user levelled up
            module.exports.verifyLevelUp(req.user,
                function(err){
                    return cb({code:"levelUpError"});
                },
                function(isLevelUp){
                    curChallengeObj.isLevelUp = isLevelUp;
                    if(isLevelUp){
                        util.log(`User has solved the challenge ${curChallengeObj.name} and leveled up!`, req.user);
                        //issue badgr badge if enabled for level
                        module.exports.badgrCall(challengeDefinitions[req.user.level].badgrInfo,req.user);    
                        return cb(null,
                            {
                                message:"Congratulations you solved the challenge and leveled up!",
                                data:curChallengeObj
                            });
                    }
                    else{
                        util.log(`User has solved the challenge ${curChallengeObj.name}!`, req.user);
                        return cb(null,
                            { 
                                message:"Congratulations you solved the challenge!", 
                                data: curChallengeObj
                            });
                    }
                });
    });

   
}