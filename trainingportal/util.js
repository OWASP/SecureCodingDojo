const crypto = require('crypto');
const fs = require('fs');
const path = require('path'); 


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

exports.loadReportCSV = function(reportCSVPath){
  if(exports.isNullOrUndefined(reportCSVPath)) return null;
  var reportUsers = null;
  //load the CSV
  var csvText = fs.readFileSync(path.join(__dirname, reportCSVPath), 'utf8');
  if(!exports.isNullOrUndefined(csvText)){
    //split the csv into lines
    reportUsers = {"totalMembers":0,"inProgressMembers":0,"completeMembers":0,"teamList":[]};
    var lines = csvText.split("\n");
    var linesCount = lines.length;
    if(linesCount > 1){
      var teams = lines[0].trimRight().split(",");
      var teamsCount = teams.length;
      if(teamsCount>=1){
        
        for(var idx=0; idx<teamsCount; idx++){
          reportUsers.teamList[idx]={"team":teams[idx], "completed": 0, "members": []};
        }

        for(var idx1=1;idx1<linesCount;idx1++){
          var rowMembers = lines[idx1].trimRight().split(",");

          for(var idx2=0; idx2<teamsCount; idx2++){
            
            if(rowMembers[idx2].length>0){
              reportUsers.teamList[idx2].members.push({"name":rowMembers[idx2].trim(),"status":"Not Started"});
              reportUsers.totalMembers++;
             
            }
          }
        }
      }
    }
  }
  return reportUsers;
}