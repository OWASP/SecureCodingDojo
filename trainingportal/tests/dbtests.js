var db = require('../db');
var async = require('async');

//Test Suite
async.waterfall([
    //cleanup test data in case previous run failed
    function (cb){
        db.deleteUser("testDeleteMe",function(err){cb(err);},function(result){cb(null,result);});
    },
    function(result, cb){
        db.deleteUser("testDeleteMe1",function(err){cb(err);},function(result){cb(null,result);});
    },
    function(result, cb){
        db.deleteUser("testDeleteMe2",function(err){cb(err);},function(result){cb(null,result);});
    },
    //TEST SUITE 1 - USER MANAGEMENT
    //Insert user
    function(result, cb){
        db.insertUser({accountId:"testDeleteMe",familyName:"LastTest", givenName:"FirstTest"},
        function(err){
            console.log("FAIL: insertUser");
            cb(err);
        },function(result){ 
            console.log("SUCCESS: insertUser");
            cb(null,result);
        });
    },
    //GET user
    function(result, cb){
        db.getUser("testDeleteMe",
        function(err){
            console.log("FAIL: getUser");
            cb(err);
        },function(user){ 
            console.log("SUCCESS: getUser");
            console.log(user);
            user.familyName = "UpdatedLastTest";
            user.givenName = "UpdatedFirstLastTest";
            cb(null,user);
        });
    },
    //Update user
    function(user, cb){
        db.updateUser(user,
        function(err){
            console.log("FAIL: updateUser");
            cb(err);
        },function(user){ 
            console.log("SUCCESS: updateUser");
            console.log(user);
            user.familyName = "UpdatedLastTest";
            user.givenName = "UpdatedFirstLastTest";
            cb(null,user);
        });
    },
    //GET user after update
    function(result, cb){
        db.getUser("testDeleteMe",
        function(err){
            console.log("FAIL: getUser after update");
            cb(err);
        },function(user){ 
            console.log(user);
            if(user.familyName == "UpdatedLastTest" &&
            user.givenName == "UpdatedFirstLastTest"){
                console.log("SUCCESS: getUser after update");
                cb(null,user);
            }
            else{
                cb(new Error("Did not update."));
            }
        });
    },
    //Delete user after update
    function(result, cb){
        db.deleteUser("testDeleteMe",
        function(err){
            console.log("FAIL: deleteUser");
            cb(err);
        },function(result){ 
            console.log("SUCCESS: deleteUser");
            cb(null,result);
        });
    },
    //TEST SUITE 2 - Team Management
    //Setup create users
    function(result, cb){
        db.insertUser({accountId:"testDeleteMe1",familyName:"LastTest1", givenName:"FirstTest1"},function(err){cb(err);},function(result){cb(null,result);});
    },
    function(result, cb){
        db.insertUser({accountId:"testDeleteMe2",familyName:"LastTest2", givenName:"FirstTest2"},function(err){cb(err);},function(result){cb(null,result);});
    },
    //this will be the account owner for the team
    function(result, cb){
        db.getUser("testDeleteMe1",function(err){cb(err);},function(result){cb(null,result);});
    },
    //Insert Team
    function(user, cb){
        db.insertTeam(user,{name:"testTeamDeleteMe"},
        function(err){
            console.log("FAIL: insertTeam");
            cb(err);
        },function(result){ 
            console.log("SUCCESS: insertTeam");
            cb(null,[user,result]);
        });
    },
    //Fetch Teams
    function([user,result], cb){
        db.fetchTeams(
        function(err){
            console.log("FAIL: fetchTeams");
            cb(err);
        },function(result){ 
            if(result.length > 0){
                console.log("SUCCESS: fetchTeams");
            }
            cb(null,[user,result]);
        });
    },
    //Get Team with members by name
    function([user,result], cb){
        db.getTeamWithMembersByName("testTeamDeleteMe",
        function(err){
            console.log("FAIL: getTeamWithMembersByName");
            cb(err);
        },function(team){ 
            if(team.members[0].givenName===user.givenName){
                console.log("SUCCESS: getTeamWithMembersByName");
            }
            else{
                console.log("FAIL: getTeamWithMembersByName");
                cb(new Error("Invalid team"));
            }
            console.log(team);
            cb(null,[user,team]);
        });
    },
    //Get team by id
    function([user,team], cb){
        db.getTeamById(team.id,
        function(err){
            console.log("FAIL: getTeamById");
            cb(err);
        },function(team2){ 
            if(team.id===team2.id){
                console.log("SUCCESS: getTeamById");
                cb(null,[user,team]); //pass the user for the next test
            }
            else{
                console.log("FAIL: getTeamById");
                cb(new Error("Incorrect team selection."));
            }
        });
    },
    //Delete Team 
    function([user,team], cb){
        db.deleteTeam(user,team.id,
        function(err){
            console.log("FAIL: deleteTeam");
            cb(err);
        },function(result){ 
            console.log("SUCCESS: deleteTeam");
            cb(null,user); //pass the user for the next test
        });
    },
    //Insert challenge enty
    function(user, cb){
        db.insertChallengeEntry(user.id, "cwe306",
        function(err){
            console.log("FAIL: insertChallengeEntry");
            cb(err);
        },function(result){ 
            console.log("SUCCESS: insertChallengeEntry");
            cb(null,user); //pass the user for the next test
        });
    },
    //Get entries for user
    function(user, cb){
        db.fetchChallengeEntriesForUser(user,
        function(err){
            console.log("FAIL: fetchChallengeEntriesForUser");
            cb(err);
        },function(result){ 
            console.log(result);
            if(result.length === 1){
                console.log("SUCCESS: fetchChallengeEntriesForUser");
                cb(null,user); //pass the user for the next test
            }
            else{
                console.log("FAIL: fetchChallengeEntriesForUser");
                cb(new Error("Incorrect number of entries for user"));
            }
        });
    },
    //Get activity for user
    function(user, cb){
        db.fetchActivity(user.givenName,10,
        function(err){
            console.log("FAIL: fetchActivity");
            cb(err);
        },function(result){ 
            console.log(result);
            if(result.length === 1){
                console.log("SUCCESS: fetchActivity");
                cb(null,user); //pass the user for the next test
            }
            else{
                console.log("FAIL: fetchActivity");
                cb(new Error("Incorrect activity for user"));
            }
        });
    },
    //Get challenge stats
    function(user, cb){
        db.getChallengeStats(
        function(err){
            console.log("FAIL: getChallengeStats");
            cb(err);
        },function(result){ 
            console.log(result);
            console.log("SUCCESS: getChallengeStats");
            cb(null,user); //pass the user for the next test
        });
    },
    //Get challenge stats
    function(user, cb){
        db.getLevelStats(
        function(err){
            console.log("FAIL: getLevelStats");
            cb(err);
        },function(result){ 
            console.log(result);
            console.log("SUCCESS: getLevelStats");
            cb(null,user); //pass the user for the next test
        });
    },
    //Get challenge stats
    function(user, cb){
        db.getTeamStats(
        function(err){
            console.log("FAIL: getTeamStats");
            cb(err);
        },function(result){ 
            console.log(result);
            console.log("SUCCESS: getTeamStats");
            cb(null,user); //pass the user for the next test
        });
    },
    function(result, cb){
        console.log("===== ALL TESTS HAVE PASSED ======");
        cb(null,null);
    }
], function(err){
    if(err) throw new Error(err);
});


