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
const util = require(path.join(__dirname, 'util'));
const config = util.getConfig();
const db = require(path.join(__dirname, 'db'));
const validator = require('validator');
const crypto = require('crypto');
const aescrypto = require(path.join(__dirname, 'aescrypto'));
const https = require('https');
const qna = require(path.join(__dirname, 'qna'));

var modules = {};
var moduleVer = 0;
var challengeDefinitions = [];
var challengeNames = [];
var solutions = [];
var descriptions = [];
var masterSalt = "";

let loadModules = () => { 
    let modsPath;
    if(!util.isNullOrUndefined(process.env.DATA_DIR)){
        modsPath = path.join(process.env.DATA_DIR, "modules.json");
    }    
    if(util.isNullOrUndefined(modsPath) || !fs.existsSync(modsPath)){
        modsPath = path.join(__dirname, "static/lessons/modules.json");
    }
    let moduleDefs = require(modsPath);
    let localModules = {};
    let moduleIds = Object.keys(moduleDefs);
    for(let moduleId of moduleIds){
        if(moduleId === "version"){
            moduleVer = moduleDefs[moduleId];
            continue;
        }
        let disabled = config.disabledModules;
        if(util.isNullOrUndefined(disabled) || !disabled.includes(moduleId)){
            localModules[moduleId] = moduleDefs[moduleId];
        }
    }
    return Object.freeze(localModules); 
  }
  

let getModulePath = (moduleId) => {
    return path.join('static/lessons/', moduleId);
}

let getDefinitionsForModule = (moduleId) => {

    try {
        var defs = Object.freeze(require(path.join(__dirname, getModulePath(moduleId), '/definitions.json')));
        return defs;
    } catch (error) {
        console.log(error.message)
    }
    return [];
}


/**
 * Initializes challenges when this module is loaded
 */
let init = async () => {   
    modules = loadModules();
    for(let moduleId in modules){
        let moduleDefinitions = getDefinitionsForModule(moduleId);
        var modulePath = getModulePath(moduleId);
        for(let level of moduleDefinitions){
            challengeDefinitions.push(level);
            for(let challenge of level.challenges){
                if(!util.isNullOrUndefined(challengeNames[challenge.id])){
                    throw new Error(`Duplicate challenge id: '${challenge.id}'!`);
                }
                challengeNames[challenge.id] = challenge.name;
                descriptions[challenge.id] = path.join(modulePath, challenge.description);
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

    let dbModuleVersion = await db.getModuleVersion();
    if(dbModuleVersion < moduleVer){
        util.log("New training modules version, updating module completion for all users.")
        recreateBadgesOnModulesUpdate();
        db.updateModuleVersion(moduleVer);
    } 
}

init();

let getModules = function(){ return modules; }
let getChallengeNames = function(){ return challengeNames; }

let isPermittedModule = async (user, moduleId) => {
    let badges = await db.fetchBadges(user.id);
    if(util.isNullOrUndefined(modules[moduleId])){
        return false;
    }

    let requiredModules = modules[moduleId].requiredModules;

    for(let moduleId of requiredModules){
        let found = false;
        for(let badge of badges){
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
 * Get the user level based on the amount of passed challenges
 */
let getUserLevelForModule = async (user,moduleId) => {
    let moduleDefinitions = getDefinitionsForModule(moduleId);
    let passedChallenges =  await db.fetchChallengeEntriesForUser(user);
    let userLevel=-1;
    for(let level of moduleDefinitions){
        let passCount = 0;
        for(let chDef of level.challenges) {
            for(let passedCh of passedChallenges){
                if(chDef.id===passedCh.challengeId){
                    passCount++;
                }
            }
        }
        if(passCount===level.challenges.length){
            userLevel = level.level;
        }
        else{
            break;
        }
    }
    return userLevel;
}

/**
 * Get permitted challenges for module
 */
let getPermittedChallengesForUser = async (user, moduleId) => {    
    if(util.isNullOrUndefined(moduleId)) return [];    
    if(util.isNullOrUndefined(modules[moduleId])) return [];

    var permittedLevel = await getUserLevelForModule(user, moduleId) + 1;

    var moduleDefinitions = getDefinitionsForModule(moduleId);

    for(let level of moduleDefinitions){
        if (permittedLevel === level.level) {
            return level.challenges;
        }
    }
        
    return [];
}

/**
 * Construct the challenge definitions loaded on the client side based on the users level
 * @param {Array} moduleIds The lesson module ids
 */
let getChallengeDefinitions = async (moduleId) => {
    var returnChallenges = [];
    
    if(util.isNullOrUndefined(moduleId)) return [];    
    if(util.isNullOrUndefined(modules[moduleId])) return [];

    var modulePath = getModulePath(moduleId);
    var moduleDefinitions = getDefinitionsForModule(moduleId);

    for(let level of moduleDefinitions){
        for(let challenge of level.challenges) {
            //update the play link if it exists
            if (!util.isNullOrUndefined(config.playLinks)) {
                var playLink = config.playLinks[challenge.id];
                if (!util.isNullOrUndefined(playLink)) {
                    challenge.playLink = playLink;
                }
            }
            var description = challenge.description;
            if(!util.isNullOrUndefined(description) && description.indexOf(modulePath) === -1){
                challenge.description = path.join(modulePath, description);
            }
            if(challenge.type === "quiz"){
                challenge.question = qna.getCode(challenge.id);
            }
        }
        returnChallenges.push(level);
    }
        
    return returnChallenges;
}



/**
 * Returns the solution html (converted from markdown)
 * @param {The challenge id} challengeId 
 */
let getSolution = function (challengeId) {
    var solution = solutions[challengeId];
    var solutionHtml = "";
    if(!util.isNullOrUndefined(solution)){
        var solutionMarkDown = fs.readFileSync(path.join(__dirname, solution),'utf8');
        solutionHtml = util.parseMarkdown(solutionMarkDown);
    }

    return solutionHtml;
}

/**
 * Returns the description html (converted from markdown if applicable)
 * @param {The challenge id} challengeId 
 */
let getDescription = function (challengeId) {
    var description = descriptions[challengeId];
    var descriptionHtml = "";
    if(util.isNullOrUndefined(description)) return "";

    var descriptionPath = path.join(__dirname, description);
    
    if(!fs.existsSync(descriptionPath)) return "";

    var descriptionText = fs.readFileSync(descriptionPath,'utf8');
    if(description.endsWith(".md")){
        descriptionHtml = util.parseMarkdown(descriptionText);
    }
    else{
        descriptionHtml = descriptionText;
    }
    
    return descriptionHtml;
}

/**
 * Checks if the user has completed the module and issue a badge
 */
let verifyModuleCompletion = async (user, moduleId) => {
    var userLevel = await getUserLevelForModule(user, moduleId);
    let moduleDefinitions = getDefinitionsForModule(moduleId);
    var lastLevel = moduleDefinitions[moduleDefinitions.length-1];

    if(lastLevel.level===userLevel){
        //training module complete
        let badges = await db.fetchBadges(user.id);
        let found = false;
        for(let badge of badges){
            if(badge.moduleId===moduleId){
                found = true;
                break;
            }
        }
        if(!found){
            util.log(`WARN: Fixed badge for module ${moduleId} for user.`, user);
            await db.insertBadge(user.id, moduleId);
        }
        return true;
    }

    return false;
}

/**
 * Iterates through the entire list of users to insert badges where needed
 */
let recreateBadgesOnModulesUpdate = async () => {
  
    let users = await db.fetchUsersWithId();
        
    for(let user of users){
        let entries = await db.fetchChallengeEntriesForUser(user);
  
        var passedChallenges = [];
        for(let entry of entries){
          passedChallenges.push(entry.challengeId);
        }
        
        user.passedChallenges = passedChallenges;
        for(let moduleId in modules){
            try {
                await verifyModuleCompletion(user, moduleId);
            } catch (error) {
                util.log("Error with badge verification.", user);
            }
        }
    }
  }

/**
 * Retrieves a code to verify completion of the level
 * @param {Badge} badge 
 */
let getBadgeCode = (badge, user) => {
    let module = modules[badge.moduleId];

    if(util.isNullOrUndefined(module) || util.isNullOrUndefined(module.badgeInfo)) return null;

    let info = {
        badgeInfo: module.badgeInfo,
        givenName: user.givenName,
        familyName: user.familyName,
        completion: badge.timestamp,
        idHash: crypto.createHash('sha256').update(user.id+masterSalt).digest('hex').substr(0,10)
    }

    let infoStr = JSON.stringify(info);
    let buf = Buffer.from(infoStr);
    let encoded = buf.toString('base64');

    let integrity = crypto.createHash('sha256').update(encoded+masterSalt).digest('base64');
   
    let code = `${encoded}.${integrity}`;
    return encodeURIComponent(code);
}

/**
 * Verifies a badge code and returns parsed info
 * @param {Base64} badgeCode 
 */
let verifyBadgeCode = (badgeCode) => {
    urlDecoded = decodeURIComponent(badgeCode);
    let parts = urlDecoded.split(".");
    if(parts.length !== 2) return null;
    //verify the hash matches
    let vfHash = crypto.createHash('sha256').update(parts[0]+masterSalt).digest('base64');
    if(vfHash !== parts[1]) return null;
    try {
        let decoded = Buffer.from(parts[0],"Base64").toString();
        let parsed = JSON.parse(decoded);
        return parsed;
    } catch {
        
    }

    return null;
}

/**
 * Issue a badge for achieving a level
 * @param {*} badgrInfo 
 * @param {*} user 
 */
let badgrCall = function(badgrInfo, user){
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
        };
        
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
let apiChallengeCode = async (req) => {
    if(util.isNullOrUndefined(req.body.challengeId) || 
        util.isNullOrUndefined(req.body.challengeCode) ||
        util.isNullOrUndefined(req.body.moduleId)){
        throw Error("invalidRequest");
    }


    var moduleId = req.body.moduleId.trim();
    var challengeId = req.body.challengeId.trim();
    var challengeCode = req.body.challengeCode.trim();

    let challengeType = "page";
    if(!util.isNullOrUndefined(req.body.challengeType)){
        challengeType = req.body.challengeType;
    }

    if(["page","quiz"].indexOf(challengeType) === -1){
        throw Error("invalidChallengeType");
    }

    let answer = null;
    if(!util.isNullOrUndefined(req.body.answer)){
        answer = req.body.answer.trim();
    }

    if(util.isNullOrUndefined(challengeCode) || 
    (validator.isAlphanumeric(challengeCode) === false && validator.isBase64(challengeCode) === false) ){
        throw Error("invalidCode");
    }

    if(util.isNullOrUndefined(moduleId) || validator.isAlphanumeric(moduleId) === false){
        throw Error("invalidModuleId");
    }

    if(util.isNullOrUndefined(challengeId) || util.isAlphanumericOrUnderscore(challengeId) === false){
        throw Error("invalidChallengeId");
    }


    //check id
    var availableChallenges = null;
    var curChallengeObj = null;

    //identify the current challenge object and also the available challenges for the current user level
    var availableChallenges = await getPermittedChallengesForUser(req.user, moduleId);
    
    //search for the current challenge id
    for(let availableChallenge of availableChallenges){
        if(challengeId === availableChallenge.id){
            curChallengeObj = availableChallenge;
            break;
        }
    }

    if(curChallengeObj===null){
        throw Error("challengeNotAvailable");
    }
    
    //calculate the hash
    let ms = "";
    if(util.isNullOrUndefined(modules[moduleId].skipMasterSalt) || modules[moduleId].skipMasterSalt===false){
        ms = masterSalt;
    }

    if(challengeType !== "quiz"){
        answer = challengeId+req.user.codeSalt;      
    }

    //either hex or base64 formats should work
    let verificationHashB64 = crypto.createHash('sha256').update(answer+ms).digest('base64');
    let verificationHashHex = crypto.createHash('sha256').update(answer+ms).digest('hex');
    
    if(challengeCode.indexOf(verificationHashB64)!==0 && challengeCode.indexOf(verificationHashHex)!==0){
        if(challengeType === "quiz"){
            throw Error("invalidAnswer");            
        }
        else{
            throw Error("invalidCode");
        }
    } 

    //success update challenge
    curChallengeObj.moduleId = moduleId;
    return insertChallengeEntry(req.user, curChallengeObj, moduleId);
   
}

/**
 * Inserts a challenge entry
 */
let insertChallengeEntry = async (user,curChallengeObj, moduleId) => {
    await db.getPromise(db.insertChallengeEntry, [user.id,curChallengeObj.id]);
    //issue badgr badge if enabled
    badgrCall(curChallengeObj.badgrInfo,user);
    let isModuleComplete = await verifyModuleCompletion(user,moduleId);
    //check to see if the user levelled up
    curChallengeObj.moduleComplete = isModuleComplete;
    if(isModuleComplete){
        util.log(`User has solved the challenge ${curChallengeObj.name} and completed the module!`, user);
        //issue badgr badge if enabled for module
        badgrCall(modules[moduleId].badgrInfo,user);    
        return {
                "message":"Congratulations you solved the challenge and completed the module! You can now get your badge of completion.",
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



module.exports = {
    apiChallengeCode,
    badgrCall,
    getBadgeCode,
    getChallengeNames,
    getChallengeDefinitions,
    getDescription,
    getModules,
    getPermittedChallengesForUser,
    getUserLevelForModule,
    getSolution,
    insertChallengeEntry,
    isPermittedModule,
    verifyBadgeCode,
    verifyModuleCompletion,
    recreateBadgesOnModulesUpdate
}