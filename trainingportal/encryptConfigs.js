const path = require('path');
const aescrypto = require(path.join(__dirname, 'aescrypto'));
const challengeSecrets = Object.freeze(require(path.join(__dirname, 'challengeSecrets.json')));
const uid = require('uid-safe');
//temporarily write your passwords here, cleanup after generating the encrypted settings
var dbpass="<db pass>";//DELETE ME WHEN DONE
var slacksecret="<slack secret>";//DELETE ME WHEN DONE
var sessionsecret="<random session secret>";//DELETE ME WHEN DONE




console.log("======= config.js ==========");

//You can use the following script from  when you update your key to a new value
console.log('config.encDbPass="'+aescrypto.encrypt(dbpass)+'"');
console.log('config.encSlackClientSecret="'+aescrypto.encrypt(slacksecret)+'"');
console.log('config.encExpressSessionSecret="'+aescrypto.encrypt(sessionsecret)+'"');



//use this code to generate challenge secrets with a new key

for(var key in challengeSecrets){
    challengeSecrets[key] = uid.sync(16);
}



console.log("======= challengeSecrets.json ==========");

for(var key in challengeSecrets){
    console.log('"'+key+'":"'+aescrypto.encrypt(challengeSecrets[key],process.env.CHALLENGE_KEY,process.env.CHALLENGE_KEY_IV)+'",');
}

console.log("======= insecureinc/src/inc/insecure/code.properties ==========");

//this bit is for the insecure app put in the codes.properties file
for(var key in challengeSecrets){
    console.log(key+'='+aescrypto.encrypt(challengeSecrets[key],process.env.CHALLENGE_KEY,process.env.CHALLENGE_KEY_IV));
}
var cwe307pass = aescrypto.decrypt("7ztgLop+tdLnCZ7/K8WcjQ==","BruteForceIsFun","CrackingAndDecyrptingIsBetter");
console.log("cwe307pass="+aescrypto.encrypt(cwe307pass,process.env.CHALLENGE_KEY,process.env.CHALLENGE_KEY_IV));
