const path = require('path');
const config = require(path.join(__dirname, 'config'));
var aesCrypto = require(path.join(__dirname, 'aescrypto'));
var util = require(path.join(__dirname, 'util'));
var mysql = require('mysql2');
var fs = require('fs');

const MYSQL_CONFIG = {
  host: config.dbHost,
  database: config.dbName,
  user: config.dbUser,
  password: aesCrypto.decrypt(config.encDbPass),
  multipleStatements:true
}

function getConn(errCb,doneCb){
  var con = mysql.createConnection(MYSQL_CONFIG);
  con.errCb = errCb;
  con.doneCb = doneCb;
  con.hasErrorCb = errCb !=null && errCb !== 'undefined';
  con.hasDoneCb = doneCb !=null && doneCb !== 'undefined';
  con.handleErr = function(err){
    util.log(err);
    if(con.hasErrorCb) con.errCb(err);
  }
  con.handleDone = function(result){
    con.end();
    if(con.hasDoneCb) con.doneCb(result);
  }
  return con;
}

exports.init = function(){
  var con = getConn();
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

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
  });
}


//Creates a user in the database
exports.insertUser = function(user,errCb,doneCb){
  var con = getConn(errCb,doneCb);
  
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "INSERT INTO users (id, accountId, teamId, level, familyName, givenName) VALUES (null, ?, null, ?, ?, ?)";
    con.query(sql, [user.accountId, user.level, user.familyName, user.givenName], function (err, result) {
      if (err) con.handleErr(err);
      else con.handleDone(result);
    });
  });
}



//fetches a user from the database
exports.getUser = function(accountId,errCb,doneCb){
  var con = getConn(errCb,doneCb);

  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "SELECT * FROM users WHERE accountId = ? LIMIT 1";
    con.query(sql, [accountId], function (err, result) {
      if(err) con.handleErr(err);
      else
      {
        if(result.length >= 1) con.handleDone(result[0]);
        else con.handleDone(null);
      }
      
    });
  });
}


//deletes a user from the database
exports.deleteUser = function(accountId,errCb,doneCb){
  var con = getConn(errCb,doneCb);

  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "DELETE FROM users WHERE accountId = ? LIMIT 1";
    con.query(sql, [accountId], function (err, result) {
      if(err) con.handleErr(err);
      else con.handleDone(result);
      
    });
  });
}

//updates the properties of a user in the database
exports.updateUser = function(user,errCb,doneCb){
  var con = getConn(errCb,doneCb);
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "UPDATE users SET accountId = ?, teamId = ?, level = ?, familyName = ?, givenName = ? WHERE id = ?";
    con.query(sql, [user.accountId, user.teamId, user.level, user.familyName, user.givenName, user.id], function (err, result) {
      if(err) con.handleErr(err);
      else con.handleDone(result);
       
    });
  });
}

//fetches the list of users from the database only with public info
exports.fetchUsers = function(errCb,doneCb){
  var con = getConn(errCb,doneCb);
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "SELECT givenName,familyName,level,teamId FROM users";
    con.query(sql, function (err, result) {
       if(err) con.handleErr(err);
       else{
         con.handleDone(result);
      }
    });
  });
}

//Creates a team in the database
exports.insertTeam = function(user,team,errCb,doneCb){
  var con = getConn(errCb,doneCb);
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }


    var sql = "INSERT INTO teams (id, name, ownerid) VALUES (null, ?, ?);";
    con.query(sql, [team.name, user.id], function (err, result) {
      if(err) con.handleErr(err);
      else{
        //get the newly created team and update user
        exports.getTeamWithMembersByName(team.name,
        function(err){
          util.log('Failed to get team');
          con.handleErr(err);
        }
        ,function(team){
          user.teamId = team.id;
          exports.updateUser(user,
          function(err){
            util.log('Failed to update user');
            con.handleErr(err);
          },
          function(){
           con.handleDone();
          });
        })
      }     
    });
  });
}


//fetches the list of teams from the database
exports.fetchTeams = function(errCb,doneCb){
  var con = getConn(errCb,doneCb);
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "SELECT * FROM teams";
    con.query(sql, function (err, result) {
       if(err) con.handleErr(err);
       else{
         con.handleDone(result);
      }
    });
  });
}

//fetches a team and its members from the database by its name (unique)
exports.getTeamWithMembersByName = function(name,errCb,doneCb){
  var con = getConn(errCb,doneCb);
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "SELECT * FROM teams WHERE name = ? LIMIT 1";
    con.query(sql, [name], function (err, result) {
       if(err) con.handleErr(err);
       else{
        if(result.length >= 1){
          var team = result[0];
          //execute one more query to get the team members
          var sql = "SELECT level,givenName,familyName FROM users WHERE teamId = ?";
          con.query(sql, [team.id], function (err, result) {
            if(err) con.handleErr(err);
            else{
              team.members = result;
              con.handleDone(team);
            }
          });
        } 
        else con.handleDone(null);
      }
    });
  });
}

//fetches a team from the database by id
exports.getTeamById = function(id,errCb,doneCb){
  var con = getConn(errCb,doneCb);
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "SELECT * FROM teams WHERE id = ? LIMIT 1";
    con.query(sql, [id], function (err, result) {
       if(err) con.handleErr(err);
       else{
        if(result.length >= 1){
          con.handleDone(result[0]);
        } 
        else con.handleDone(null);
      }
    });
  });
}

//updates the properties of a team in the database
exports.updateTeam = function(user, team, errCb,doneCb){
  var con = getConn(errCb,doneCb);
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "UPDATE teams SET name = ?, description = ? WHERE id = ? and ownerId = ?";
    con.query(sql, [team.name, team.description, team.id, user.id], function (err, result) {
      if(err) con.handleErr(err);
      else con.handleDone(result);
       
    });
  });
}

//deletes a team from the database
exports.deleteTeam = function(user,teamId,errCb,doneCb){
  var con = getConn(errCb,doneCb);

  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "DELETE FROM teams WHERE id = ? and ownerId = ?";
    con.query(sql, [teamId, user.id], function (err, result) {
      if(err) return con.handleErr(err);
      else{
       //set all users that are part of this team to have teamId null
        var sql = "UPDATE users SET teamId = null WHERE teamId = ?";
        con.query(sql, [teamId], function (err, result) {
          if(err) return con.handleErr(err);
          else return con.handleDone(result);
        });
      }
      
    });
  });
}



//Creates a user in the database
exports.insertChallengeEntry = function(userId, challengeId, errCb, doneCb){
  var con = getConn(errCb,doneCb);
  
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }
    //remove previous entries of this challengeId for this user
    var sql = "DELETE FROM challengeEntries WHERE userId = ? and challengeId = ?";
    con.query(sql, [userId,challengeId], function (err, result) {
      if (err) con.handleErr(err);
      else{
        var sql = "INSERT INTO challengeEntries (id, userId, challengeId) VALUES (null, ?, ?)";
        con.query(sql, [userId,challengeId], function (err, result) {
          if (err) con.handleErr(err);
          else con.handleDone(result);
        });
      }
      
    });
    
  });
}

//fetches the list of teams from the database
exports.fetchChallengeEntriesForUser = function(user,errCb,doneCb){
  var con = getConn(errCb,doneCb);
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }

    var sql = "SELECT * FROM challengeEntries WHERE userId = ?";
    con.query(sql, [user.id], function (err, result) {
       if(err) con.handleErr(err);
       else{
         con.handleDone(result);
      }
    });
  });
}



/**
 * Fetches the list of challenge entries in descending order, practically the activity
 * @param {*} errCb 
 * @param {*} doneCb 
 */
exports.fetchActivity = function(query,limit,errCb,doneCb){
  var con = getConn(errCb,doneCb);
  con.connect(function(err) {
    if(err){
       con.handleErr(err);
       return;
    }
    
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
       if(err) con.handleErr(err);
       else{
         con.handleDone(result);
      }
    });
  });
}
