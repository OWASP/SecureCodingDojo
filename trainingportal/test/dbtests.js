var db = require('../db');
var async = require('async');
var assert = require('assert');
const { resolve } = require('path');
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
        var users = [];
        const USER_COUNT = 5;
        before(async () => {

            for(let i = 0; i < USER_COUNT; i++){
                let acctId = `deleteMeTeamMember${i}`;
                await db.getPromise(db.insertUser,{accountId:acctId,familyName:`LastTeamMember${i}`, givenName:`BadgeTeamFirstTeamMember${i}`});
                users.push(await db.getPromise(db.getUser,acctId));
            }

            await db.getPromise(db.insertTeam,[users[1],{name:"testTeamDeleteMe2"}]);
            team = await db.getPromise(db.getTeamWithMembersByName,"testTeamDeleteMe2");

            await db.getConn().queryPromise("UPDATE users SET teamId = ? WHERE accountId LIKE 'deleteMeTeam%'",[team.id]);
            //the fourth user is not in the team
            await db.getConn().queryPromise("UPDATE users SET teamId = NULL WHERE accountId = 'deleteMeTeamMember3'");

            //update dates
            let now = new Date();
            now.setDate(now.getDate()-6);

            //the fifth member doesn't have a badge
            let promise = null;
            for(let i = 0; i < USER_COUNT-1; i++){
                let timeStamp = now.toString();
                promise = db.getConn().queryPromise("INSERT INTO badges (id, userId, moduleId, timestamp) VALUES (null, ?, ?, ?)",
                [users[i].id, "blackBelt", timeStamp]);
                await promise;
                now.setDate(now.getDate()-20);
            }

            return promise; //last
            
        });

        it('should get the module stats without error', async () =>{
            let promise = db.getModuleStats();
            let result = await promise;
            assert(result!==null,"Result should not be null");
            assert(result.length > 0 ,"Result should have more than 0 rows");
            return promise;
        });
    
        it('should get the team members by badges without error', async () => {
            let promise = db.getTeamMembersByBadges(team.id);
            let result = await promise;
            assert.notStrictEqual(result, null,"Result should not be null");
            const EXPECTED_ROWS = 4;
            assert.strictEqual(result.length, EXPECTED_ROWS ,`Result should have ${EXPECTED_ROWS} rows`);

            const EXPECTED_FIRST_NAME = "BadgeTeamFirstTeamMember4"; //BadgeTeamFirstTeamMember4 doesn't have a badge
            assert.strictEqual(result[0].givenName,EXPECTED_FIRST_NAME,`First entry should be '${EXPECTED_FIRST_NAME}'`);
            assert.strictEqual(result[0].moduleId,null,`${EXPECTED_FIRST_NAME} should have no badges`);

            let filterWithBadge = result.filter(user => user.moduleId !== null);
            assert.strictEqual(filterWithBadge.length,EXPECTED_ROWS-1,`Wrong amount of team users with badges`);

            let filterNoBadge = result.filter(user => user.moduleId === null);
            assert.strictEqual(filterNoBadge.length,1,`Wrong amount of team users without badges`);

            return promise;
        });

        it('should get the team members by badges without error', async () => {
            let promise = db.getTeamMembersByBadges(team.id);
            let result = await promise;
            assert.notStrictEqual(result, null,"Result should not be null");
            const EXPECTED_ROWS = 4;
            assert.strictEqual(result.length, EXPECTED_ROWS ,`Result should have ${EXPECTED_ROWS} rows`);

            const EXPECTED_FIRST_NAME = "BadgeTeamFirstTeamMember4"; //BadgeTeamFirstTeamMember4 doesn't have a badge
            assert.strictEqual(result[0].givenName,EXPECTED_FIRST_NAME,`First entry should be '${EXPECTED_FIRST_NAME}'`);
            assert.strictEqual(result[0].moduleId,null,`${EXPECTED_FIRST_NAME} should have no badges`);

            let filterWithBadge = result.filter(user => user.moduleId !== null);
            assert.strictEqual(filterWithBadge.length,EXPECTED_ROWS-1,`Wrong amount of team users with badges`);

            let filterNoBadge = result.filter(user => user.moduleId === null);
            assert.strictEqual(filterNoBadge.length,1,`Wrong amount of team users without badges`);

            return promise;
        });
        
        
        it('should get the team members by badge in the last days count', async () => {
            let promise = db.getTeamMembersByBadges(team.id,7);
            let result = await promise;

            assert.notStrictEqual(result, null,"Result should not be null");
            assert.strictEqual(result.length, 1 ,`Result should have 1 rows for the past 7 days`);

            promise = db.getTeamMembersByBadges(team.id,30);
            result = await promise;

            assert.notStrictEqual(result, null,"Result should not be null");
            assert.strictEqual(result.length, 2 ,`Result should have 2 rows for the past 30 days`);

            return promise;
        });

        it('should get the all users with badges for a particular module id without error', async () => {
            let promise = db.getAllUsersForBadge("blackBelt");
            let result = await promise;
            assert.notStrictEqual(result, null,"Result should not be null");
            assert(result.length >= 1, "Result should have at least 1 row"  );

            let filter = result.filter(user => user.givenName.indexOf("BadgeTeam") > -1);

            assert.strictEqual(filter.length,USER_COUNT-1,`There should be at least '${USER_COUNT-1}' blackBelts`);

            return promise;
        });

        after(async () => {
            for(let user of users){
                await db.getConn().queryPromise("DELETE FROM users WHERE id = ?",[user.id]);
                await db.getConn().queryPromise("DELETE FROM badges WHERE userId = ?",[user.id]);
            }
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

