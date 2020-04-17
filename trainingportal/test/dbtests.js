var db = require('../db');
var async = require('async');
var assert = require('assert');
//Test Suite

//we need reference to a global promise so the tests don't run until the test user was created
var insertUserPromise = null; 
async function waitForInsertUser(){
    while(insertUserPromise === null) {} //wait for promise to get initialized
    await insertUserPromise;
}


describe('db', function() {
    before(async() => {
        await db.getConn().queryPromise("DELETE FROM users WHERE accountId like '%Delete%'");
    });

    describe('#getVersion()', () => {
        it('should return the correct schema version', async () => {
            let versionPromise = db.getPromise(db.getVersion);
            let version = await versionPromise;
            assert.equal(version,db.SCHEMA_VERSION);
            return versionPromise;
        });
    });

    describe('#insertUser(),getUser()', () => {
        it('should insert one row without error', async () => {
            insertUserPromise = db.getPromise(db.insertUser,{accountId:"testDeleteMe",familyName:"LastTest", givenName:"FirstTest"});
            let result = await insertUserPromise;
            assert.notEqual(result,null);
            return insertUserPromise;
        });
        it('should retrieve the user without error', async () => {
            waitForInsertUser();
            let getUserPromise = db.getPromise(db.getUser, "testDeleteMe");
            let user = await getUserPromise;
            assert(user!==null,"Could not get user");
            assert.equal(user.givenName,"FirstTest");
            assert.equal(user.familyName,"LastTest");
            return getUserPromise;
        });
    
    
    });



    describe('#updateUser()', function() {
        it('should update the user without error', function(done) {
            waitForInsertUser();
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

    describe('#getTeamStats()', async () => {
        it('should get the team stats without error', async () => {
            let promise = db.getTeamStats(null);
            let result = await promise;
            assert(result!==null,"Result should not be null");
            assert(result.length > 0 ,"Result should have more than 0 rows");
            return promise;
        });
    });

    describe('#getTeamMembersByBadges(), #getModuleStats()', async () => {
        var team = null;
        var user = null;
        before(async () => {
            await db.getPromise(db.insertUser,{accountId:"deleteMeTeamMember1",familyName:"LastTeamMember1", givenName:"AAAFirstTeamMember1"});
            await db.getPromise(db.insertUser,{accountId:"deleteMeTeamMember2",familyName:"LastTeamMember2", givenName:"AAAFirstTeamMember2"});
            user = await db.getPromise(db.getUser,"deleteMeTeamMember2");

            await db.getPromise(db.insertTeam,[user,{name:"testTeamDeleteMe2"}]);
            team = await db.getPromise(db.getTeamWithMembersByName,"testTeamDeleteMe2");

            await db.getConn().queryPromise("UPDATE users SET teamId = ? WHERE accountId LIKE 'deleteMeTeam%'",[team.id]);
            
            return db.insertBadge(user.id,"blackBelt");
            
        });

        it('should get the module stats without error', async () =>{
            let promise = db.getModuleStats();
            let result = await promise;
            assert(result!==null,"Result should not be null");
            assert(result.length > 0 ,"Result should have more than 0 rows");
            return promise;
        });
    
        it('should get the team members with badges without error', async () => {
            let promise = db.getTeamMembersByBadges(team.id);
            let result = await promise;
            assert.notEqual(result, null,"Result should not be null");
            assert.equal(result.length, 2 ,"Result should have 2 rows");
            
            assert.equal(result[0].givenName,"AAAFirstTeamMember1","First entry should be 'FirstTeamMember1'");
            assert.equal(result[0].moduleId,null,"FirstTeamMember1 should have no badges");

            assert.equal(result[1].givenName,"AAAFirstTeamMember2","Second entry should be 'FirstTeamMember2'");
            assert.equal(result[1].moduleId,"blackBelt","FirstTeamMember2 should have the 'blackBelt' badge");


            return promise;
        });

        it('should get the all users with badges for a particular module id without error', async () => {
            let promise = db.getAllUsersForBadge("blackBelt");
            let result = await promise;
            assert.notEqual(result, null,"Result should not be null");
            assert(result.length >= 1, "Result should have at least 1 row");
            
            assert.equal(result[0].givenName,"AAAFirstTeamMember2","First entry should be 'AAAFirstTeamMember2'");
            assert.equal(result[0].moduleId,"blackBelt","AAAFirstTeamMember2 should have the 'blackBelt' badge");

            return promise;
        });

        after(async () => {
            await db.getConn().queryPromise("DELETE FROM users WHERE teamId = ?",[team.id]);
            await db.getConn().queryPromise("DELETE FROM badges WHERE userId = ?",[user.id]);
            return db.getConn().queryPromise("DELETE FROM teams WHERE id = ?",[team.id]);

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

    describe('#insertChallengeEntry(),#fetchChallengeEntriesForUser(),#fetchActivity(),#getChallengeStats()', function() {

        var user = null;
        before(async () => {
            await db.getPromise(db.insertUser,{accountId:"testDeleteMeChallenges",familyName:"LastTest1", givenName:"FirstTest1"});
            user = await db.getPromise(db.getUser,"testDeleteMeChallenges");
        });


        it('should insert a challenge entry without error', async () => {
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe306"]);
            let promise = db.getPromise(db.fetchChallengeEntriesForUser, user);
            let challenges = await promise;
            assert.equal(challenges.length,1,"Incorrect number of entries for user");
            assert.equal(challenges[0].challengeId,"cwe306","Incorrect challenge entry id for user");                                
            assert.notEqual(challenges[0].timestamp,null,"Timestamp should not be null");  
            return promise;     
        });

        it('should get the correct number of activities', async () => {
            let promise = db.getPromise(db.fetchActivity, [user.givenName,10]);
            let result = await promise;
            assert.equal(result.length,1,"Incorrect number of activity entries for user");
            return promise;
        });

        it('should get the challenge stats without error', async () => {
            let promise = db.getPromise(db.getChallengeStats);
            let result = await promise;

            assert(result!==null,"Result should not be null");
            assert(result.length > 0 ,"Result should have more than 0 rows");

            return promise;
        });

        after(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE id=?",[user.id]);
            await db.getConn().queryPromise("DELETE FROM badges WHERE userId=?",[user.id]);
            return db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId=?",[user.id]);
        })
    });

   
    after(async () => {
        await db.getConn().queryPromise("DELETE FROM users WHERE accountId like '%Delete%'");
        await db.getConn().queryPromise("DELETE FROM teams WHERE name like '%Delete%'");
        
        let promise = new Promise((resolve,reject)=>{
            db.getConn().end();
            resolve(null);
        });
        
        return promise;
        
    })
});

