var db = require('../db');
var challenges = require('../challenges');
var async = require('async');
var assert = require('assert');

describe('db', function() {
    
    before(function(){
        db.deleteUser("levelUpUser");
    });

    describe('#verifyLevelUp() - no challenges', function() {
        it('should fail to level up without challenges', function(done) {
            async.waterfall([
                function (cb){
                    db.insertUser({accountId:"levelUpUser",familyName:"LastLevelUp", givenName:"FirstLevelUp"},function(err){cb(err);},function(result){cb(null,result);});
                },                
                function (result, cb){
                    db.getUser("levelUpUser",
                        function(err){
                            cb(err);
                        },function(user){                            
                            cb(null,user);
                        });
                },
                function(user, cb){
                    assert.notEqual(user, null, "Failed test setup - user null");
                    challenges.verifyLevelUp(user,
                        function(err){
                            cb(err);
                        },
                        function(result){
                            assert.notEqual(result,true,"Shouldn't have leveled up");
                            done();
                        });
                }
            ],function(err){
                done(err);
            });
        });
    });

    describe('#verifyLevelUp() - insufficient challenges', function() {
        it('should fail to level up with only two challenges', function(done) {
            async.waterfall([              
                function (cb){
                    db.getUser("levelUpUser",
                        function(err){
                            cb(err);
                        },function(user){                            
                            cb(null,user);
                        });
                },
                //Insert challenge entries
                function(user, cb){
                    db.insertChallengeEntry(user.id, "cwe306",function(err){cb(err);},function(result){cb(null,user);});
                },
                function(user, cb){
                    db.insertChallengeEntry(user.id, "cwe807",function(err){cb(err);},function(result){cb(null,user);});
                },
                function(user, cb){
                    challenges.verifyLevelUp(user,
                        function(err){
                            cb(err);
                        },
                        function(result){
                            assert.notEqual(result,true,"Shouldn't have leveled up");
                            done();
                        });
                }
            ],function(err){
                done(err);
            });
        });
    });

    describe('#verifyLevelUp() - level up case', function() {
        it('should level up ', function(done) {
            async.waterfall([              
                function (cb){
                    db.getUser("levelUpUser",
                        function(err){
                            cb(err);
                        },function(user){ 
                            assert.notEqual(user,null,"Failed test setup");
                            assert.equal(user.level,null,"User level should be null");                           
                            cb(null,user);
                        });
                },
                //Insert challenge entries
                function(user, cb){
                    db.insertChallengeEntry(user.id, "cwe862",function(err){cb(err);},function(result){cb(null,user);});
                },
                function(user, cb){
                    challenges.verifyLevelUp(user,
                        function(err){
                            cb(err);
                        },
                        function(result){
                            assert.equal(result,true,"Should have leveled up");
                            cb(null,user);
                        });
                },
                function(user, cb){
                    db.getUser("levelUpUser",
                    function(err){
                        cb(err);
                    },function(user){ 
                        assert.equal(user.level,1,"User level not updated");
                        done();
                    });
                }
            ],function(err){
                done(err);
            });
        });
    });

    after(function(){
        async.waterfall([
            //cleanup test data 
            function (cb){
                db.getUser("levelUpUser",
                    function(err){
                        cb(err);
                    },function(user){ 
                        cb(null,user);
                    });
            },
            function(user,cb){
                db.getConn().query("DELETE FROM challengeEntries WHERE userId = ?",[user.id],
                    function(err){
                        cb(err);
                    },function(result){
                        cb(null,result);
                    });
            },
            function (cb){
                db.deleteUser("testDeleteMe",
                function(err){
                    cb(err);
                },function(result){ 
                    cb(null,null);
                }); 
            },
            function(result, cb){
                db.getConn().end();
            }
        ],function(err){
            if(err) throw new Error(err);
        });
        
    });

});

