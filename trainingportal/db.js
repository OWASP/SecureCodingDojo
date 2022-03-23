const SCHEMA_VERSION = 5;
module.exports.SCHEMA_VERSION = SCHEMA_VERSION;
const path = require('path');
const util = require(path.join(__dirname, 'util'));
const config = util.getConfig();
const aesCrypto = require(path.join(__dirname, 'aescrypto'));
const mysql = require('mysql2');
var sqlite3 = null;
const fs = require('fs');
const async = require('async');

var MYSQL_CONFIG = null;
var liteDB = null;

if(util.isNullOrUndefined(config.dbHost)){
  sqlite3 = require('sqlite3');

  //use sqlite insted of mysql
  var dbPath = "";
  var dbFileName = "securecodingdojo.db";
  var dataDir = util.getDataDir();
  dbPath = path.join(dataDir, dbFileName);
  liteDB = new sqlite3.Database(dbPath);
}
else {
  MYSQL_CONFIG = {
    connectionLimit:100,
    host: config.dbHost,
    database: config.dbName,
    user: config.dbUser,
    password: aesCrypto.decrypt(config.encDbPass),
    multipleStatements:true
  };
}

class Connection{
  
  constructor (){
    if(MYSQL_CONFIG!==null){
      this.conPool = mysql.createPool(MYSQL_CONFIG);
    }
  }


  query(sql,params,callback){

    if(arguments.length===2){
      if(typeof params === 'function'){
        callback = params;
        params = [];
      }
    }

    if(MYSQL_CONFIG!==null){
      if(this.conPool._closed){
        this.conPool = mysql.createPool(MYSQL_CONFIG);
      }
      this.conPool.query(sql,params,callback);
    }
    else{
      liteDB.all(sql,params,callback);      
    }
  }

  /**
   * Creates a promise with the query function so it can be called with async/await
   * @param {String} sql The SQL statement to execute
   * @param {*} params Optional array of parameters to pass to the statement
   */
  queryPromise(sql, params){
    let promise = new Promise((resolve,reject) => {
      this.query(sql,params,function(err,result){
        if(err){
          reject(err);
        }
        else{
          resolve(result);
        }
      });
    });

    return promise;
  }



  exec(sql){
    let promise = new Promise((resolve,reject) => {
      var callback = (err,result) => {
        if(err){
          reject(err);
        }
        else{
          resolve(result);
        }
      };

      if(MYSQL_CONFIG!==null){
        this.conPool.query(sql,callback);
      }
      else{
        liteDB.exec(sql,callback);
      }

    });

    return promise;
    
  }

  end(){
    if(MYSQL_CONFIG!==null){
      this.conPool.end();
    }
  }
}

var connection = new Connection();

/**
 * Returns a database connection to use
 * @param {*} errCb 
 * @param {*} doneCb 
 */
function getConn(){
  return connection;
}

exports.getConn = getConn;

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

/**
 * Utility function to get a promise from a db function 
 */
exports.getPromise = function(dbFunc, params){
  let promise = new Promise((resolve,reject) => {
      if(util.isNullOrUndefined(params)) params = [];
      if(!Array.isArray(params)) params = [params];
      let count = params.length;
      switch(count){
        case 0: dbFunc(reject, resolve); break;
        case 1: dbFunc(params[0], reject, resolve);break;
        case 2: dbFunc(params[0], params[1], reject, resolve);break;
      }
    });
  return promise;
};

exports.init = async () => {
  var con = getConn();
  var sql = "";
  var dbSetup = "";
  if(MYSQL_CONFIG!==null){
    sql = "SELECT * from users";
    dbSetup = "sql/dbsetup.mysql.sql";
  }
  else{
    sql = "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name = 'users'";
    dbSetup = "sql/dbsetup.sqlite.sql";
  }

  var error = null;
  var result = null;
  try {
    result = await con.queryPromise(sql);
  } catch(err) {
    console.log(err)
    error = err;
  }

  var setupNeeded = (MYSQL_CONFIG === null && result.length>0 && result[0].count===0) || (MYSQL_CONFIG !== null && error !== null);


  if (setupNeeded){
    //there's no user table
    var setupScript = fs.readFileSync(path.join(__dirname, dbSetup), 'utf8');
    try {
      await con.exec(setupScript);
      util.log("Database tables created");
    } catch (error) {
      util.log("Database setup failed");
      console.log(error);
    }
    
  }
  else { //run db maintenance scripts
    util.log("Database tables exist.");
    //check db version
    let version = null;
    try
    {
      version = await exports.getPromise(exports.getVersion);
    }
    catch(err){
      console.log(err);
    }

    if(util.isNullOrUndefined(version)) version = 2; //started versioning from 3

    if(version < SCHEMA_VERSION){
        
      //run the scripts for each missing version
      for(let ver = version+1; ver <= SCHEMA_VERSION; ver++){
        var maintenanceFilePath = "sql/dbupgrade.v"+ver;
        if(MYSQL_CONFIG!==null){
          maintenanceFilePath+=".mysql.sql";
        }
        else{
          maintenanceFilePath+=".sqlite.sql";
        }
        var maintenanceScript = fs.readFileSync(path.join(__dirname, maintenanceFilePath), 'utf8');
        util.log(`Running database upgrade script '${maintenanceFilePath}'`);
        try {
          await con.exec(maintenanceScript);
          util.log("Database upgrade completed");
        } catch (error) {
          util.log("Database upgrade failed");
          console.log(error);
        }

       
        if(ver===4){
          //in version 4 badges were introduced, insert badges for all users that are level 7 and level 8
          let users = await con.queryPromise("SELECT * FROM users WHERE level > 6");
          for(let user of users){
            await exports.insertBadge(user.id, "blackBelt");
            if(user.level > 7){
              await exports.insertBadge(user.id, "secondDegreeBlackBelt");
            }
          }
          console.log("Badges created for all users");
        }
      }
    }
  }
};


//Creates a user in the database
exports.insertUser = function(user,errCb,doneCb){
  var con = getConn();
  var sql = "INSERT INTO users (id, accountId, teamId, familyName, givenName) VALUES (null, ?, ?, ?, ?)";
  
  con.query(sql, [user.accountId, user.teamId, user.familyName, user.givenName], function (err, result) {
    if (err) handleErr(errCb,err);
    else handleDone(doneCb,result);
  });
};

//gets the database schema version
exports.getVersion = function(errCb,doneCb){
  var con = getConn();
  var sql = "SELECT version FROM dbInfo";
  con.query(sql, function (err, result) {
    if(err) handleErr(errCb,err); 
    else
    {
      if(result.length >= 1) handleDone(doneCb,result[0].version);
      else handleDone(doneCb, null);
    }
  });
};

//fetches a user from the database
exports.getUser = function(accountId,errCb,doneCb){
  var con = getConn();
  var sql = "SELECT * FROM users WHERE accountId = ? ";
  con.query(sql, [accountId], function (err, result) {
    if(err) handleErr(errCb,err);
    else
    {
      if(result.length >= 1) handleDone(doneCb,result[0]);
      else handleDone(doneCb, null);
    }
  });
};

//fetches a user from the database by id
exports.getUserById = async (userId) => {
  var con = getConn();
  var sql = "SELECT * FROM users WHERE id = ? ";
  let user = await con.queryPromise(sql,[userId]);
  return user;
};

//deletes a user from the database
exports.deleteUser = function(accountId,errCb,doneCb){
  var con = getConn();
  var sql = "DELETE FROM users WHERE accountId = ? ";
  con.query(sql, [accountId], function (err, result) {
    if(err) handleErr(errCb,err);
    else handleDone(doneCb,result);
  });
};

//updates the properties of a user in the database
exports.updateUser = function(user,errCb,doneCb){
  var con = getConn();
  var sql = "UPDATE users SET accountId = ?, teamId = ?, familyName = ?, givenName = ? WHERE id = ?";
  con.query(sql, [user.accountId, user.teamId, user.familyName, user.givenName, user.id], function (err, result) {
    if(err) handleErr(errCb,err);
    else handleDone(doneCb,result);
      
  });
};

//fetches the list of users from the database only with public info
exports.fetchUsers = function(errCb,doneCb){
  var con = getConn();
  var sql = "SELECT givenName,familyName,teamId FROM users";
  con.query(sql, function (err, result) {
      if(err) handleErr(errCb,err);
      else{
        handleDone(doneCb,result);
    }
  });
};

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
};


//fetches the list of teams from the database
exports.fetchTeams = function(errCb,doneCb){
  var con = getConn();
  var sql = "SELECT * FROM teams order by name";
  con.query(sql, function (err, result) {
      if(err) handleErr(errCb,err);
      else{
        handleDone(doneCb,result);
    }
  });
};

//fetches a team and its members from the database by its name (unique)
exports.getTeamWithMembersByName = function(name,errCb,doneCb){
  var con = getConn();
  var sql = "SELECT * FROM teams WHERE name = ? ";
  con.query(sql, [name], function (err, result) {
      if(err) handleErr(errCb,err);
      else{
      if(result.length >= 1){
        var team = result[0];
        //execute one more query to get the team members
        var sql = "SELECT givenName,familyName FROM users WHERE teamId = ?";
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
};

//fetches a team from the database by id
exports.getTeamById = function(id,errCb,doneCb){
  var con = getConn();
  var sql = "SELECT * FROM teams WHERE id = ? ";
  con.query(sql, [id], function (err, result) {
      if(err) handleErr(errCb,err);
      else{
      if(result.length >= 1){
        handleDone(doneCb,result[0]);
      } 
      else handleDone(doneCb,null);
    }
  });
};

//updates the properties of a team in the database
exports.updateTeam = function(user, team, errCb,doneCb){
  var con = getConn();
  var sql = "UPDATE teams SET name = ?, description = ? WHERE id = ? and ownerId = ?";
  con.query(sql, [team.name, team.description, team.id, user.id], function (err, result) {
    if(err) handleErr(errCb,err);
    else handleDone(doneCb,result);
      
  });
};

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
};

/**
 * Gets a team members with completed modules
 */
exports.getTeamMembersByBadges = async (teamId, days) => {
  let con = getConn();
  let sql = "SELECT badges.moduleId, badges.timestamp, users.givenName, users.familyName FROM users LEFT JOIN badges on badges.userId=users.id";
  let args = [];
  if(teamId !== null && teamId !== "*"){
    sql+=" WHERE users.teamId = ?";
    args = [teamId];
  }
  sql+=" order by badges.moduleId, users.givenName, users.familyName";
  let result = await con.queryPromise(sql,args);

  if(days){
    let now = new Date();
    now.setDate(now.getDate()-days);
    let ts = now.getTime();
    result = result.filter(record => {
      if(!record.timestamp) return false;
      let recordTs = new Date(record.timestamp).getTime();
      return recordTs > ts;
    });
  }
  return result;
};

/**
 * Gets a list of users for a module id
 */
exports.getAllUsersForBadge = async (moduleId) => {
  let con = getConn();
  let sql = "SELECT badges.moduleId, users.givenName, users.familyName FROM users INNER JOIN badges on badges.userId=users.id WHERE badges.moduleId = ? "+
  " order by badges.moduleId, users.givenName, users.familyName";
  let result = await con.queryPromise(sql,[moduleId]);
  return result;
};

//Creates a user in the database
exports.insertChallengeEntry = function(userId, challengeId, errCb, doneCb){
  var con = getConn();
  var sql = "DELETE FROM challengeEntries WHERE userId = ? and challengeId = ?";
  con.query(sql, [userId,challengeId], function (err, result) {
    if (err) handleErr(errCb,err);
    else{
      var timeStamp = Date().toString();
      var sql = "INSERT INTO challengeEntries (id, userId, challengeId, timestamp) VALUES (null, ?, ?, ?)";
      con.query(sql, [userId, challengeId, timeStamp], function (err, result) {
        if (err) handleErr(errCb,err);
        else handleDone(doneCb,result);
      });
    }
  });
};

/**
 * Inserts a badge for a completed training module
 */
exports.insertBadge = async (userId, moduleId) => {
  var con = getConn();

  var sql = "DELETE FROM badges WHERE userId = ? and moduleId = ?"; //in the unlikely situation they exist replace badges for the same module
  await con.queryPromise(sql,[userId, moduleId]);
  
  var timeStamp = Date().toString();
  sql = "INSERT INTO badges (id, userId, moduleId, timestamp) VALUES (null, ?, ?, ?)";
  await con.queryPromise(sql,[userId, moduleId, timeStamp]);
};


/**
 * Returns the badges for the specified user
 */
exports.fetchBadges = async (userId) => {
  let con = getConn();

  let sql = "SELECT * FROM badges WHERE userId = ?"; 
  let result = await con.queryPromise(sql,[userId]);
  return result;
};

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
};



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
    var concat = "CONCAT(users.givenName,' ',users.familyName)";
    if(MYSQL_CONFIG===null){
      concat = "users.givenName || ' ' || users.familyName";
    }
    sql = "SELECT challengeEntries.challengeId, challengeEntries.timestamp, users.givenName, users.familyName, users.teamId "+
      " FROM challengeEntries INNER JOIN users on users.id=challengeEntries.userId "+
      "WHERE "+concat+" LIKE ? order by challengeEntries.id desc LIMIT ?";
    args = [query, limit];
  }
  else{
    sql = "SELECT challengeEntries.challengeId, challengeEntries.timestamp, users.givenName, users.familyName, users.teamId "+
    " FROM challengeEntries INNER JOIN users on users.id=challengeEntries.userId order by challengeEntries.id desc LIMIT ?";
    args = [limit];
  }
  con.query(sql, args, function (err, result) {
    if(err) handleErr(errCb,err);
    else{
      handleDone(doneCb,result);
    }
  });
};
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
};

/**
 * Players by module id
 * @param {*} errCb 
 * @param {*} doneCb 
 */
exports.getModuleStats = async () => {
  var con = getConn();
  var sql = "SELECT badges.moduleId, count(*) as playerCount FROM badges group by badges.moduleId";
  var args = [];
  
  return con.queryPromise(sql, args);
};

/**
 * Players by team
 * @param {*} errCb 
 * @param {*} doneCb 
 */
exports.getTeamStats= async (limit) => {
  var con = getConn();

  let result = await con.queryPromise("select * from users");
  const allPlayerCount = result.length;

  var sql = "SELECT teams.id as id, teams.name as teamName, count(users.id) as playerCount from teams INNER JOIN users on users.teamId=teams.id group by teams.id order by playerCount desc";
  var args = [];

  if(limit!==null){
    sql+=" limit ?";
    args=[limit];
  }
  
  result = await con.queryPromise(sql, args);

  result.splice(0,0,{id:"*", teamName: "All Teams", playerCount: allPlayerCount});

  return result;
  
};



