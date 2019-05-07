var db = require('../db');
var async = require('async');
var assert = require('assert');
//Test Suite

describe('db', function() {
    before(function(){
        db.getConn().query("DELETE FROM users WHERE accountId like '%Delete%'");
    });

    describe('#insertUser(),getUser()', function() {
        it('should insert one row without error', function(done) {
            db.insertUser({accountId:"testDeleteMe",familyName:"LastTest", givenName:"FirstTest"},
            function(err){
                done(err);
            },function(result){ 
                done();
            });
        });
        it('should retrieve the user without error', function(done) {
            db.getUser("testDeleteMe",
            function(err){
                done(err);
            },function(user){ 
                assert(user!=null,"Could not get user");
                assert.equal(user.givenName,"FirstTest");
                assert.equal(user.familyName,"LastTest");
                done();
            });  
        });
    });



    describe('#updateUser()', function() {
        it('should update the user without error', function(done) {

            async.waterfall([
                function(cb){
                    db.getUser("testDeleteMe",
                    function(err){
                        console.log("FAIL: getUser before update");
                        cb(err);
                    },function(user){ 
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
                        assert.equal(user.familyName, "UpdatedLastTest","Did not update family name!");
                        assert.equal(user.givenName, "UpdatedFirstLastTest","Did not update first name!");
                        done();
                    });
                },
            ],function(err){
                done(err);
            });    
      });
    });

    describe('#deleteUser()', function() {
        it('should delete the user without error', function(done) {
            db.deleteUser("testDeleteMe",
            function(err){
                done(err);
            },function(result){ 
                done();
            }); 
      });
    });

    describe('#insertTeam()', function() {
        it('should create a team without error', function(done) {
            async.waterfall([
               //this will be the account owner for the team
                function(cb){
                    db.insertUser({accountId:"testDeleteMe1",familyName:"LastTest1", givenName:"FirstTest1"},function(err){cb(err);},function(result){cb(null,result);});
                },
                function(result, cb){
                    db.insertUser({accountId:"testDeleteMe2",familyName:"LastTest2", givenName:"FirstTest2"},function(err){cb(err);},function(result){cb(null,result);});
                },
                function(result, cb){
                    db.getConn().query("DELETE FROM teams WHERE name like '%Delete%'");
                    cb(null,null);
                }, 
                function(result, cb){
                    db.getUser("testDeleteMe1",function(err){cb(err);},function(result){cb(null,result);});
                },
                //Insert Team
                function(user, cb){
                    assert(user!=null,"Error with test setup. Owner user is null");
                    db.insertTeam(user,{name:"testTeamDeleteMe"},
                    function(err){
                        done(err);
                    },function(result){ 
                        done();
                    });
                }
            ],function(err){
                done(err);
            });
      });
    });

    describe('#fetchTeams()', function() {
        it('should fetch an array of teams without error', function(done) {
            db.fetchTeams(
            function(err){
                done(err);
            },function(result){ 
                assert(result.length > 0,"Team result Array is 0 or null.");
                done();
            });
      });
    });

    describe('#getTeamWithMembersByName()', function() {
        it('should fetch a team by name without error', function(done) {
            db.getTeamWithMembersByName("testTeamDeleteMe",
            function(err){
                done(err);
            },function(team){ 
                assert.equal(team.members[0].givenName,"FirstTest1","Expected user not part of the team");
                done();
            });
      });
    });

    describe('#getTeamById()', function() {
        it('should fetch a team by id without error', function(done) {
            async.waterfall([
                function(cb){
                    db.getTeamWithMembersByName("testTeamDeleteMe",
                    function(err){
                        cb(err);
                    },function(team){ 
                        cb(null,team)
                    });
                },
                function(team, cb){
                    db.getTeamById(team.id,
                    function(err){
                        cb(err);
                    },function(team2){
                        assert(team.id===team2.id,"Team ids don't match!"); 
                        done();
                    });
                }
            ],function(err){
                done(err);
            });    
      });
    });

    describe('#getTeamStats()', function() {
        it('should get the team stats without error', function(done) {
            db.getTeamStats(
                function(err){
                    done(err);
                },function(result){ 
                    assert(result!==null,"Result should not be null");
                    assert(result.length > 0 ,"Result should have more than 0 rows");
                    done();
                });
        });
    });


    describe('#deleteTeam()', function() {
        it('should delete a team without error', function(done) {
            async.waterfall([
                function(cb){
                    db.getTeamWithMembersByName("testTeamDeleteMe",
                    function(err){
                        cb(err);
                    },function(team){ 
                        cb(null,team)
                    });
                },
                function(team, cb){
                    db.deleteTeam({id:team.ownerId},team.id,
                    function(err){
                        cb(err);
                    },function(result){ 
                        cb(null,result);
                    });
                },
                function(cb){
                    db.getTeamWithMembersByName("testTeamDeleteMe",
                    function(err){
                        cb(err);
                    },function(result){ 
                        assert(result===null);
                        done();
                    });
                }
            ],function(err){
                done(err);
            });    
      });
    });

    describe('#insertChallengeEntry(),#fetchChallengeEntriesForUser(),#fetchActivity()', function() {
        it('should insert a challenge entry without error', function(done) {
            async.waterfall([
                function(cb){
                    db.insertUser(
                        {accountId:"testDeleteMe",familyName:"LastTest1", givenName:"FirstTest1"},
                        function(err){cb(err);},
                        function(result){cb(null,result);});
                },
                function(result,cb){
                    db.getUser("testDeleteMe",
                    function(err){
                        console.log("FAIL: getUser before update");
                        cb(err);
                    },function(user){ 
                        cb(null,user);
                    });
                },
                function(user, cb){
                    db.getUser("testDeleteMe",
                    function(err){
                        cb(err);
                    },function(user){ 
                        db.insertChallengeEntry(user.id, "cwe306",
                        function(err){
                            cb(err);
                        },function(result){ 
                            cb(null,user); //pass the user for the next test
                        });
                    });
                },
                function(user, cb){
                    db.fetchChallengeEntriesForUser(user,
                        function(err){
                            cb(err);
                        },function(result){ 
                            assert.equal(result.length,1,"Incorrect number of entries for user");
                            assert.equal(result[0].challengeId,"cwe306","Incorrect challenge entry id for user");                                
                            cb(null,user); //pass the user for the next test
                        });
                },
                //Get activity for user
                function(user, cb){
                    db.fetchActivity(user.givenName,10,
                    function(err){
                        cb(err);
                    },function(result){ 
                        assert.equal(result.length,1,"Incorrect number of activity entries for user");
                        done();
                    });
                }
            ],function(err){
                done(err);
            });    
      });
    });

    describe('#getChallengeStats()', function() {
        it('should get the challenge stats without error', function(done) {
            db.getChallengeStats(
                function(err){
                    done(err);
                },function(result){ 
                    assert(result!==null,"Result should not be null");
                    assert(result.length > 0 ,"Result should have more than 0 rows");
                    done();
                });
        });
    });

    describe('#getLevelStats()', function() {
        it('should get the level stats without error', function(done) {
            db.getLevelStats(
                function(err){
                    done(err);
                },function(result){ 
                    assert(result!==null,"Result should not be null");
                    assert(result.length > 0 ,"Result should have more than 0 rows");
                    done();
                });
        });
    });


    after(function(){
        async.waterfall([
            //cleanup test data 
            function (cb){
                db.getConn().query("DELETE FROM users WHERE accountId like '%Delete%'",function(err){cb(err);},function(result){cb(null,result);});
            },
            function (result, cb){
                db.getConn().query("DELETE FROM teams WHERE name like '%Delete%'",function(err){cb(err);},function(result){cb(null,result);});
            },
            function(result, cb){
                db.getConn().end();
            }
        ],function(err){
            if(err) throw new Error(err);
        });
    })
});

