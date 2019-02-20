const path = require('path');
const config = require(path.join(__dirname, 'config'));
var aesCrypto = require(path.join(__dirname, 'aescrypto'));
var util = require(path.join(__dirname, 'util'));
var mysql = require('mysql2');
var fs = require('fs');
var async = require('async');

const MYSQL_CONFIG = {
  connectionLimit:100,
  host: config.dbHost,
  database: config.dbName,
  user: config.dbUser,
  password: aesCrypto.decrypt(config.encDbPass),
  multipleStatements:true
}
//create DB connection pool to handle high DB load
var conPool = mysql.createPool(MYSQL_CONFIG);

/**
 * Returns a database connection to use
 * @param {*} errCb 
 * @param {*} doneCb 
 */
function getConn(){
  var con = conPool;
  return con;
}

/**
 * Utility function to handle errors
 * @param {} errCb 
 * @param {*} err 
 */
function handleErr(errCb,err){
  if(util.isNullOrUndefined(errCb)) console.log(err);
  else errCb(err);
}

/**
 * Utility function to verify done callback is defined and then execute
 * @param {*} doneCb 
 * @param {*} result 
 */
function handleDone(doneCb,result){
  if(!util.isNullOrUndefined(doneCb)) doneCb(result);
}

exports.init = function(){
  var con = getConn();
  var sql = "SELECT * FROM users";
  con.query(sql, function (err, result) {
    if (err){
      //there's no user table
      
      fs.readFile(path.join(__dirname, 'dbsetup.sql'), 'utf8', function(err, data) {
        if (err){
            util.log(err);
            return;
        }
        con.query(data);
        
      });
    }
    else{ //run db maintenance scripts
      util.log("Database tables exist.");
      fs.readFile(path.join(__dirname, 'dbmaintain.sql'), 'utf8', function(err, data) {
        if (err){
            util.log(err);
            return;
        }
        if(data.length>0) con.query(data);
        
      });
    }
  });
}


//Creates a user in the database
exports.insertUser = function(user,errCb,doneCb){
  var con = getConn();
  var sql = "INSERT INTO users (id, accountId, teamId, level, familyName, givenName) VALUES (null, ?, null, ?, ?, ?)";
  con.query(sql, [user.accountId, user.level, user.familyName, user.givenName], function (err, result) {
    if (err) handleErr(errCb,err);
    else handleDone(doneCb,result);
  });
}



//fetches a user from the database
exports.getUser = function(accountId,errCb,doneCb){
  var con = getConn();
  var sql = "SELECT * FROM users WHERE accountId = ? LIMIT 1";
  con.query(sql, [accountId], function (err, result) {
    if(err) handleErr(errCb,err);
    else
    {
      if(result.length >= 1) handleDone(doneCb,result[0]);
      else handleDone(doneCb, null);
    }
  });
}


//deletes a user from the database
exports.deleteUser = function(accountId,errCb,doneCb){
  var con = getConn();
  var sql = "DELETE FROM users WHERE accountId = ? LIMIT 1";
  con.query(sql, [accountId], function (err, result) {
    if(err) handleErr(errCb,err);
    else handleDone(doneCb,result);
  });
}

//updates the properties of a user in the database
exports.updateUser = function(user,errCb,doneCb){
  var con = getConn();
  var sql = "UPDATE users SET accountId = ?, teamId = ?, level = ?, familyName = ?, givenName = ? WHERE id = ?";
  con.query(sql, [user.accountId, user.teamId, user.level, user.familyName, user.givenName, user.id], function (err, result) {
    if(err) handleErr(errCb,err);
    else handleDone(doneCb,result);
      
  });
}

//fetches the list of users from the database only with public info
exports.fetchUsers = function(errCb,doneCb){
  var con = getConn();
  var sql = "SELECT givenName,familyName,level,teamId FROM users";
  con.query(sql, function (err, result) {
      if(err) handleErr(errCb,err);
      else{
        handleDone(doneCb,result);
    }
  });
}

//Creates a team in the database
exports.insertTeam = function(user,team,errCb,doneCb){
  var con = getConn();
  var sql = "INSERT INTO teams (id, name, ownerid) VALUES (null, ?, ?);";
  async.waterfall([
    //Execute insert statement
    function(cb){
      con.query(sql, [team.name, user.id], function (err, result) {
        if(err) cb(err);
        else{
          cb(null,result);
        }
      });
    },
    //Query for the team in the db
    function(result,cb){
      exports.getTeamWithMembersByName(team.name, 
        function(err){
          cb(err);
        }, 
        function(team){
          user.teamId = team.id;
          cb(null,[user,team]);
        });
    },
    //update the user with the team id
    function(result,cb){
      exports.updateUser(user, 
        function(err){
          cb(err);
        }, 
        function(result){
          handleDone(doneCb,result);
        });
    }
  ], 
  function(err){
    util.log('Failed to insert team');
    handleErr(errCb,err);
  });
}


//fetches the list of teams from the database
exports.fetchTeams = function(errCb,doneCb){
  var con = getConn();
  var sql = "SELECT * FROM teams";
  con.query(sql, function (err, result) {
      if(err) handleErr(errCb,err);
      else{
        handleDone(doneCb,result);
    }
  });
}

//fetches a team and its members from the database by its name (unique)
exports.getTeamWithMembersByName = function(name,errCb,doneCb){
  var con = getConn();
  var sql = "SELECT * FROM teams WHERE name = ? LIMIT 1";
  con.query(sql, [name], function (err, result) {
      if(err) handleErr(errCb,err);
      else{
      if(result.length >= 1){
        var team = result[0];
        //execute one more query to get the team members
        var sql = "SELECT level,givenName,familyName FROM users WHERE teamId = ?";
        con.query(sql, [team.id], function (err, result) {
          if(err) handleErr(errCb,err);
          else{
            team.members = result;
            handleDone(doneCb,team);
          }
        });
      } 
      else handleDone(doneCb,null);
    }
  });
}

//fetches a team from the database by id
exports.getTeamById = function(id,errCb,doneCb){
  var con = getConn();
  var sql = "SELECT * FROM teams WHERE id = ? LIMIT 1";
  con.query(sql, [id], function (err, result) {
      if(err) handleErr(errCb,err);
      else{
      if(result.length >= 1){
        handleDone(doneCb,result[0]);
      } 
      else handleDone(doneCb,null);
    }
  });
}

//updates the properties of a team in the database
exports.updateTeam = function(user, team, errCb,doneCb){
  var con = getConn();
  var sql = "UPDATE teams SET name = ?, description = ? WHERE id = ? and ownerId = ?";
  con.query(sql, [team.name, team.description, team.id, user.id], function (err, result) {
    if(err) handleErr(errCb,err);
    else handleDone(doneCb,result);
      
  });
}

//deletes a team from the database
exports.deleteTeam = function(user,teamId,errCb,doneCb){
  var con = getConn();
  var sql = "DELETE FROM teams WHERE id = ? and ownerId = ?";
  con.query(sql, [teamId, user.id], function (err, result) {
    if(err) handleErr(errCb,err);
    else{
      //set all users that are part of this team to have teamId null
      var sql = "UPDATE users SET teamId = null WHERE teamId = ?";
      con.query(sql, [teamId], function (err, result) {
        if(err) handleErr(errCb,err);
        else handleDone(doneCb,result);
      });
    }
    
  });
}


//Creates a user in the database
exports.insertChallengeEntry = function(userId, challengeId, errCb, doneCb){
  var con = getConn();
  var sql = "DELETE FROM challengeEntries WHERE userId = ? and challengeId = ?";
  con.query(sql, [userId,challengeId], function (err, result) {
    if (err) handleErr(errCb,err);
    else{
      var sql = "INSERT INTO challengeEntries (id, userId, challengeId) VALUES (null, ?, ?)";
      con.query(sql, [userId,challengeId], function (err, result) {
        if (err) handleErr(errCb,err);
        else handleDone(doneCb,result);
      });
    }
  });
}

//fetches the list of teams from the database
exports.fetchChallengeEntriesForUser = function(user,errCb,doneCb){
  var con = getConn();
  var sql = "SELECT * FROM challengeEntries WHERE userId = ?";
  con.query(sql, [user.id], function (err, result) {
      if(err) handleErr(errCb,err);
      else{
        handleDone(doneCb,result);
    }
  });
}



/**
 * Fetches the list of challenge entries in descending order, practically the activity
 * @param {*} errCb 
 * @param {*} doneCb 
 */
exports.fetchActivity = function(query,limit,errCb,doneCb){
  var con = getConn();
  var sql = "";
  var args = [];
  if(!util.isNullOrEmpty(query)){
    query = "%"+query+"%";
    sql = "SELECT challengeEntries.challengeId, users.givenName, users.familyName, users.level, users.teamId "+
      " FROM challengeEntries INNER JOIN users on users.id=challengeEntries.userId "+
      "WHERE CONCAT(users.givenName, ' ', users.familyName) LIKE ? order by challengeEntries.id desc LIMIT ?";
    args = [query, limit];
  }
  else{
    sql = "SELECT challengeEntries.challengeId, users.givenName, users.familyName, users.level, users.teamId "+
    " FROM challengeEntries INNER JOIN users on users.id=challengeEntries.userId order by challengeEntries.id desc LIMIT ?";
    args = [limit];
  }
  con.query(sql, args, function (err, result) {
    if(err) handleErr(errCb,err);
    else{
      handleDone(doneCb,result);
    }
  });
}
/**
 * Fetches the challenge stats
 * @param {*} errCb 
 * @param {*} doneCb 
 */
exports.getChallengeStats = function(errCb,doneCb){
  var con = getConn();
  var sql = "SELECT challengeId,count(*) as achieved from challengeEntries group by challengeId order by achieved asc;";
  var args = [];
  con.query(sql, args, function (err, result) {
    if(err) handleErr(errCb,err);
    else{
      handleDone(doneCb,result);
    }
  });
}

/**
 * Players by level id
 * @param {*} errCb 
 * @param {*} doneCb 
 */
exports.getLevelStats= function(errCb,doneCb){
  var con = getConn();
  var sql = "SELECT level as levelId, count(*) as playerCount from users group by level order by level desc;";
  var args = [];
  
  con.query(sql, args, function (err, result) {
    if(err) handleErr(errCb,err);
    else{
      handleDone(doneCb,result);
    }
  });
}

/**
 * Players by team
 * @param {*} errCb 
 * @param {*} doneCb 
 */
exports.getTeamStats= function(errCb,doneCb){
  var con = getConn();
  var sql = "SELECT teams.name as teamName, count(users.id) as playerCount from teams INNER JOIN users on users.teamId=teams.id group by teams.id order by playerCount desc limit 15;";
  var args = [];
  
  con.query(sql, args, function (err, result) {
    if(err) handleErr(errCb,err);
    else{
      handleDone(doneCb,result);
    }
  });
}