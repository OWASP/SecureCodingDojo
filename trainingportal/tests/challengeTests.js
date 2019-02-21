var db = require('../db');
var challenges = require('../challenges');
var async = require('async');

//Test Suite
async.waterfall([
    //cleanup test data in case previous run failed
    function (cb){
        db.deleteUser("levelUpUser",function(err){cb(err);},function(result){cb(null,result);});
    },
    //Insert user
    function(result, cb){
        db.insertUser({accountId:"levelUpUser",familyName:"LastLevelUp", givenName:"FirstLevelUp"},function(err){cb(err);},function(result){cb(null,result);});
    },
    //GET user
    function(result, cb){
        db.getUser("levelUpUser",
        function(err){
            console.log("FAIL: setup user");
            cb(err);
        },function(user){ 
            console.log("SUCCESS: setup user");
            console.log(user);
            cb(null,user);
        });
    },
    //Attempt level up with no challenges it should fail
    function(user, cb){
        challenges.verifyLevelUp(user,
            function(err){
                cb(err);
            },
            function(result){
                if(result === true){
                    console.log("FAIL verifyLevelUp with no entries");
                    cb(new Error("Shouldn't have leveled up"));
                }
                else{
                    console.log("PASS verifyLevelUp with no entries");
                    cb(null,user);
                }
            });
    },
    //Insert challenge entries
    function(user, cb){
        db.insertChallengeEntry(user.id, "cwe306",function(err){cb(err);},function(result){cb(null,user);});
    },
    function(user, cb){
        db.insertChallengeEntry(user.id, "cwe807",function(err){cb(err);},function(result){cb(null,user);});
    },
    //Attempt level up with two challenges it should fail
    function(user, cb){
        challenges.verifyLevelUp(user,
            function(err){
                cb(err);
            },
            function(result){
                if(result === true){
                    console.log("FAIL verifyLevelUp with two entries");
                    cb(new Error("Shouldn't have leveled up"));
                }
                else{
                    console.log("PASS verifyLevelUp with two entries");
                    cb(null,user);
                }
            });
    },
    function(user, cb){
        db.insertChallengeEntry(user.id, "cwe862",function(err){cb(err);},function(result){cb(null,user);});
    },
    //Now it should pass
    function(user, cb){
        challenges.verifyLevelUp(user,
            function(err){
                cb(err);
            },
            function(result){
                if(result !== true){
                    console.log("FAIL verifyLevelUp with all entries");
                    cb(new Error("Should have leveled up"));
                }
                else{
                    console.log("PASS verifyLevelUp with all entries");
                    cb(null,user);
                }
            });
    },
    //GET user
    function(result, cb){
        db.getUser("levelUpUser",
        function(err){
            console.log("FAIL: verify user");
            cb(err);
        },function(user){ 
            if(user.level===1){
                console.log("SUCCESS: verify level in db");
                cb(null,user);
            }
            else{
                console.log("FAIL: User level not updated");
                cb(new Error("Level not updated."));
            }
        });
    },
    function(result, cb){
        console.log("===== ALL TESTS HAVE PASSED ======");
        cb(null,null);
    }
], function(err){
    if(err) throw new Error(err);
});


