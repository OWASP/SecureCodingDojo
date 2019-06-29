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
const modules = Object.freeze(require(path.join(__dirname, 'static/lessons/modules.json')));
const config = require(path.join(__dirname, 'config'));
const db = require(path.join(__dirname, 'db'));
const async = require('async');
const validator = require('validator');
const crypto = require('crypto');
const aescrypto = require(path.join(__dirname, 'aescrypto'));
const https = require('https');


function getModulePath(moduleId){
    return path.join('static/lessons/', moduleId);
}

function getDefinifionsForModule(moduleId){
    var defs = Object.freeze(require(path.join(__dirname, getModulePath(moduleId), '/definitions.json')));
    return defs;
}

var challengeDefinitions = [];
var challengeNames = [];
var solutions = [];
var masterSalt = "";

/**
 * Initializes challenges when this module is loaded
 */
function init(){   
    for(moduleId in modules){
        moduleDefinitions = getDefinifionsForModule(moduleId);
        var modulePath = getModulePath(moduleId);
        for(level of moduleDefinitions){
            challengeDefinitions.push(level);
            for(challenge of level.challenges){
                challengeNames[challenge.id] = challenge.name;
                if(!util.isNullOrUndefined(challenge.solution)){
                    solutions[challenge.id] = path.join(modulePath, challenge.solution);
                }
            }
        }
    }

    if(util.isNullOrUndefined(process.env.CHALLENGE_MASTER_SALT)){
        util.log("WARNING. CHALLENGE_MASTER_SALT not set. Challenges may be bypassed.");
    }
    else{
        masterSalt=process.env.CHALLENGE_MASTER_SALT;
    }
}

init();

exports.getModules = function(){ return modules; }
exports.getChallengeNames = function(){ return challengeNames; }
exports.getChallengeDefinitions = function(){ return challengeDefinitions; }

exports.isPermittedModule = async (user, moduleId) => {
    let badges = await db.fetchBadges(user.id);
    if(util.isNullOrUndefined(modules[moduleId])){
        return false;
    }

    let requiredModules = modules[moduleId].requiredModules;

    for(moduleId of requiredModules){
        found = false;
        for(badge of badges){
            if(badge.moduleId === moduleId){
                found = true;
                break;
            }
        }
        if(!found){
            return false;
        }
    }
    return true;
}

/**
 * Construct the challenge definitions loaded on the client side based on the users level
 * @param {Object} user The session user object
 * @param {Array} moduleIds The lesson module ids
 */
exports.getChallengeDefinitionsForUser = function (user, moduleIds) {
    var returnChallenges = [];
    var permittedLevel = user.level + 1;
    
    if(util.isNullOrUndefined(moduleIds)) return [];
    
    if(!Array.isArray(moduleIds)) moduleIds = [moduleIds];
    
    for(moduleId of moduleIds){

        if(util.isNullOrUndefined(modules[moduleId])) return [];
        var modulePath = getModulePath(moduleId);
        var moduleDefinitions = getDefinifionsForModule(moduleId);

        for(level of moduleDefinitions){
            if (permittedLevel >= level.level) {
               for(challenge of level.challenges) {
                    //update the play link if it exists
                    if (!util.isNullOrUndefined(config.playLinks)) {
                        var playLink = config.playLinks[challenge.id];
                        if (!util.isNullOrUndefined(playLink)) {
                            challenge.playLink = playLink;
                        }
                        var description = challenge.description;
                        if(!util.isNullOrUndefined(description) && description.indexOf(modulePath) === -1){
                            challenge.description = path.join(modulePath, description);
                        }
                    }
                }
                returnChallenges.push(level);
            }
            else {
                returnChallenges.push({ "level": level.level, "name": level.name, "challenges": [] });
            }
        }
        
    }
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
exports.verifyLevelUp = async (user, moduleId) => {
    var userLevel = user.level !== null ? user.level : 0;
    var entries = await db.getPromise(db.fetchChallengeEntriesForUser,user);
    var shouldLevelUp = false;
    let moduleDefinitions = getDefinifionsForModule(moduleId);
    //determine if is level up
    var passedLevel=0;

    if(entries===null || entries.length===0){
        return false;
    }
    if(moduleDefinitions===null) {
        return false;
    }

    for(challengeLevel of moduleDefinitions){
        var challengesForLevel = challengeLevel.challenges;
        //check whether the entries match the level challenges
        var passCount = 0;

        for(challenge of challengesForLevel){
            for(entry of entries){
                if(entry.challengeId===challenge.id){
                    passCount++;
                }
            }
        }

        if(passCount === challengesForLevel.length){
            passedLevel = challengeLevel.level;
        }
    }

    shouldLevelUp = userLevel < passedLevel;

    //update user for level up
    if(shouldLevelUp){
        user.level = passedLevel;
        await db.getPromise(db.updateUser, user);
    }

    var lastLevel = moduleDefinitions[moduleDefinitions.length-1];

    if(lastLevel.level===passedLevel){
        //training module complete
        let badges = await db.fetchBadges(user.id);
        if(!badges.includes(moduleId)){
            await db.insertBadge(user.id, moduleId);
        }
    }

    return shouldLevelUp;
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
        
        try
        {
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
        catch(ex){
            util.log(ex);
        }
      }
    }
}

/** 
 * Logic to for the api challenge code
 */
module.exports.apiChallengeCode = async (req) => {
    if(util.isNullOrUndefined(req.body.challengeId) || 
        util.isNullOrUndefined(req.body.challengeCode) ||
        util.isNullOrUndefined(req.body.moduleId)){
        throw Error("invalidRequest");
    }

    var moduleId = req.body.moduleId.trim();
    var challengeId = req.body.challengeId.trim();
    var challengeCode = req.body.challengeCode.trim();

    if(util.isNullOrUndefined(challengeCode) || validator.isBase64(challengeCode) == false){
        throw Error("invalidCode");
    }

    if(util.isNullOrUndefined(moduleId) || validator.isAlphanumeric(moduleId) == false){
        throw Error("invalidModuleId");
    }

    if(util.isNullOrUndefined(challengeId) || validator.isAlphanumeric(challengeId) == false){
        throw Error("invalidChallengeId");
    }


    //check id
    var availableChallenges = null;
    var curChallengeObj = null;
    var userLevel = req.user.level+1;
    if(req.user.level === null) req.user.level = 0;

    //identify the current challenge object and also the available challenges for the current user level
    var moduleDefinitions = module.exports.getChallengeDefinitionsForUser(req.user, moduleId);
    for(levelObj of moduleDefinitions){
        var levelChallenges = levelObj.challenges;
        if(levelObj.level===userLevel){
            availableChallenges = levelChallenges;
        }
    }

    if(availableChallenges==null || availableChallenges.length==0){ 
        throw Error("wrongLevel");
    }

    //search for the current challenge id
    for(availableChallenge of availableChallenges){
        if(challengeId === availableChallenge.id){
            curChallengeObj = availableChallenge;
            break;
        }
    }

    if(curChallengeObj===null){
        throw Error("challengeNotFound");
    }
    
    //calculate the hash
    var verificationHash = crypto.createHash('sha256').update(challengeId+req.user.codeSalt+masterSalt).digest('base64');
    if(verificationHash!==challengeCode){
        throw Error("invalidCode");
    } 
    //success update challenge
    curChallengeObj.moduleId = moduleId;
    return module.exports.insertChallengeEntry(req.user, curChallengeObj);
   
}

/**
 * Inserts a challenge entry
 */
module.exports.insertChallengeEntry = async (user,curChallengeObj) => {
    await db.getPromise(db.insertChallengeEntry, [user.id,curChallengeObj.id]);
    //issue badgr badge if enabled
    module.exports.badgrCall(curChallengeObj.badgrInfo,user);
    let isLevelUp = await module.exports.verifyLevelUp(user,moduleId);
    //check to see if the user levelled up
    curChallengeObj.isLevelUp = isLevelUp;
    if(isLevelUp){
        util.log(`User has solved the challenge ${curChallengeObj.name} and leveled up!`, user);
        //issue badgr badge if enabled for level
        module.exports.badgrCall(challengeDefinitions[user.level].badgrInfo,user);    
        return {
                "message":"Congratulations you solved the challenge and leveled up!",
                "data":curChallengeObj
            }
    }
    else{
        util.log(`User has solved the challenge ${curChallengeObj.name}!`, user);
        return { 
                "message":"Congratulations you solved the challenge!", 
                "data": curChallengeObj
            }
    }   
}