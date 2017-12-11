const crypto = require('crypto');

exports.hasKey = function(){
  var hasKey = typeof process.env.CHALLENGE_KEY !== 'undefined' && process.env.CHALLENGE_KEY!=null;
  return hasKey;
}

/**
 * Creates a pbkdf2 salted hash
 */
exports.hashPassword = function (password, saltString){
  var salt = new Buffer(saltString,'base64');
  var passwordHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "SHA512").toString('base64');
  return passwordHash;  
}

exports.apiResponse = function(req, res, statusCode, message, result){
  if(statusCode!=200){
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
  return val == null || typeof val === 'undefined';
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
    finalMessage+=user.givenName+" "+user.familyName+" - ";
  }
  
  finalMessage += message;

  if(!exports.isNullOrUndefined(req) && !exports.isNullOrUndefined(req.originalUrl)){
    finalMessage+=" - " + req.originalUrl;
  }

  //remove new lines to prevent log forging
  finalMessage = finalMessage.replace(/[\r\n]/g," ");
  console.log(finalMessage);
}