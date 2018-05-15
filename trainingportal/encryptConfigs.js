const path = require('path');
const crypto = require('crypto');
const aescrypto = require(path.join(__dirname, 'aescrypto'));
const util = require(path.join(__dirname, 'util'));

const challengeSecrets = require(path.join(__dirname, 'challengeSecrets.json'));
const uid = require('uid-safe');
//temporarily write your passwords here, cleanup after generating the encrypted settings
var dbPass="<db pass>";//DELETE ME WHEN DONE
var slackSecret="<slack secret>";//DELETE ME WHEN DONE
var googleSecret="<google secret>";//DELETE ME WHEN DONE
var sessionSecret=uid.sync(64);

var regenerateSecrets = false; //change to regenerate challenge secrets every time
var encryptChallengeSecrets = false;
var badgrToken = "<badgr token>";

const config = require(path.join(__dirname, 'config'));
const fs = require('fs');

console.log("======= config.js ==========");

//You can use the following script from  when you update your key to a new value
console.log('config.encDbPass="'+aescrypto.encrypt(dbPass)+'";');
console.log('config.encSlackClientSecret="'+aescrypto.encrypt(slackSecret)+'";');
console.log('config.encGoogleClientSecret="'+aescrypto.encrypt(googleSecret)+'";');
console.log('config.encExpressSessionSecret="'+aescrypto.encrypt(sessionSecret)+'";');
console.log('config.encBadgrToken="'+aescrypto.encrypt(badgrToken)+'";');


if(!util.isNullOrUndefined(config.samlProviderPvkFilePath)){
    var samlProviderPvk = fs.readFileSync(path.join(__dirname, config.samlProviderPvkFilePath), 'utf-8');
    var encSamlProviderPvk = aescrypto.encrypt(samlProviderPvk);
    console.log(encSamlProviderPvk);
} 


/**
 * Use this function to generate the properties for a local user
 */
function genLocalUser(username, givenName, familyName, password){
    
    var saltString = crypto.randomBytes(16).toString('base64').toString();
    var passwordHash = util.hashPassword(password,saltString);
    
    var user = {"givenName":givenName,"familyName":familyName,"passHash":passwordHash,"passSalt":saltString};
    console.log(username+":"+JSON.stringify(user));
}

//genLocalUser("organizer","Organizer","","<enter your password here>");//DELETE ME WHEN DONE

//use the following code to generate challenge secrets
for(var key in challengeSecrets){
    if(challengeSecrets[key]==="" || regenerateSecrets)
        challengeSecrets[key] = uid.sync(16);
}

console.log("======= challengeSecrets.json ==========");
var hasKey = util.hasKey();
if(!hasKey && encryptChallengeSecrets)
    console.log("Configure the CHALLENGE_KEY and CHALLENGE_KEY_IV environment variables to store the secrets encrypted!");

for(var key in challengeSecrets){
    if(hasKey && encryptChallengeSecrets)
        console.log('"'+key+'":"'+aescrypto.encrypt(challengeSecrets[key],process.env.CHALLENGE_KEY,process.env.CHALLENGE_KEY_IV)+'",');
    else
        console.log('"'+key+'":"'+challengeSecrets[key]+'",');
}

console.log("======= insecureinc/src/inc/insecure/code.properties ==========");

//this bit is for the insecure app, put in the codes.properties file
for(var key in challengeSecrets){
    if(hasKey && encryptChallengeSecrets)
        console.log(key+'='+aescrypto.encrypt(challengeSecrets[key],process.env.CHALLENGE_KEY,process.env.CHALLENGE_KEY_IV));
    else
        console.log(key+'='+challengeSecrets[key]);
}
