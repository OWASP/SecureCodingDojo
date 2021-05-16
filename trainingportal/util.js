const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const markdown = require('markdown').markdown;
var config = null;

exports.getDataDir = () => {
  let dataDir = process.env.DATA_DIR;
  if(exports.isNullOrUndefined(dataDir)){
    dataDir = __dirname;
  }
  return dataDir;
}

exports.getConfig = () => {
  if(!config){
    let dataDir = exports.getDataDir();
    let configPath = path.join(dataDir, 'config.json');
    if(!fs.existsSync(configPath)){
      console.warn(`WARNING: Config file not found at ${configPath}. Trying default file.`);
      configPath = path.join(__dirname, 'config.json');
      if(!fs.existsSync(configPath)){
        //if still doesn't exist exit
        console.error(`ERROR: Config file not found.`);
        process.exit(1);
      }
    }
    config = require(configPath);
  }
  return config;
}

exports.hasKey = function(){
  var hasKey = typeof process.env.CHALLENGE_KEY !== 'undefined' && process.env.CHALLENGE_KEY!=null;
  return hasKey;
}

/**
 * Creates a pbkdf2 salted hash
 */
exports.hashPassword = function (password, saltString){
  var salt = Buffer.from(saltString,'base64');
  var passwordHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "SHA512").toString('base64');
  return passwordHash;  
}

exports.apiResponse = function(req, res, statusCode, message, result){
  if(statusCode>=400){
    //log the error
    exports.log("Error message sent: " + message, req.user, req);
  }
  res.send({
    status: statusCode, //http status code
    statusMessage:message,
    result: result
  });
}

/**
 * Whether the variable is null or undefined
 * @param {*} val 
 */
exports.isNullOrUndefined = function(val){
  return val === null || typeof val === 'undefined';
}

/**
 * Whether the value is null or empty
 * @param {*String} val 
 */
exports.isNullOrEmpty = function(val){
  return exports.isNullOrUndefined(val) || val.trim() === "";
}
/**
 * Logs the message including date
 */
exports.log = function(message,user,req){
  var finalMessage = new Date().toString()+" - ";

  if(!exports.isNullOrUndefined(user) && !exports.isNullOrUndefined(user.givenName) && !exports.isNullOrUndefined(user.familyName)){
    finalMessage+=`${user.givenName} ${user.familyName} (id: ${user.id}), `;
  }
  
  finalMessage += message;

  if(!exports.isNullOrUndefined(req) && !exports.isNullOrUndefined(req.originalUrl)){
    finalMessage+=" - " + req.originalUrl;
  }

  //remove new lines to prevent log forging
  finalMessage = finalMessage.replace(/[\r\n]/g," ");
  console.log(finalMessage);
}


exports.isAlphanumericOrUnderscore = (string) => {
  return string.match(/^[a-zA-Z0-9_]+$/) !== null;
}

/**
 * Util function to conver markdown to html
 */
exports.parseMarkdown = (text) => {
  let html = markdown.toHTML(text);
  //made code tag non bindable by angular
  html = html.replace(/<code/g,"<code ng-non-bindable ");
  return html
}

exports.getPrivacyHtml = () => {
  let dataDir = exports.getDataDir();
  let polPath = path.join(dataDir,"privacy.md");
  if(!fs.existsSync(polPath)){
    return null;
  }

  let md = fs.readFileSync(polPath,"utf-8");
  let html = exports.parseMarkdown(md);
  return html;
}