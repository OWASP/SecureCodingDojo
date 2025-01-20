var db = require('../db');
var assert = require('assert');
//Test Suite


describe('db', () => {

    beforeAll(async() => {
        await db.getConn().queryPromise("DELETE FROM users WHERE accountId like '%Delete%'");
    });

    describe('#getPromise',()=>{

        test('should return the correct schema version', async () => {
            let versionPromise = db.getPromise(db.getVersion);
            let version = await versionPromise;
            assert.strictEqual(version,db.SCHEMA_VERSION);
            return versionPromise;
        });

        test('should insert one row without error', async () => {
            insertUserPromise = db.getPromise(db.insertUser,{accountId:"testDeleteMe",familyName:"LastTest", givenName:"FirstTest"});
            let result = await insertUserPromise;
            assert.notEqual(result,null);
            return insertUserPromise;
        });

    });

    describe('Users',()=>{

        test('should retrieve the user without error', async () => {
            let user = await db.getPromise(db.getUser, "testDeleteMe");
            assert(user!==null,"Could not get user");
            assert.strictEqual(user.givenName,"FirstTest");
            assert.strictEqual(user.familyName,"LastTest");
        });

        test('should update the user without error', async () => {
            //get existing user
            let user = await db.getPromise(db.getUser, "testDeleteMe");
            //update the user
            user.familyName = "UpdatedLastTest";
            user.givenName = "UpdatedFirstLastTest";
            db.getPromise(db.updateUser, user);
            //check the user was updated
            user = await db.getPromise(db.getUser, "testDeleteMe");
            assert.strictEqual(user.familyName, "UpdatedLastTest","Did not update family name!");
            assert.strictEqual(user.givenName, "UpdatedFirstLastTest","Did not update first name!");
        });

        test('should delete the user without error', async () => {
            await db.getPromise(db.deleteUser, "testDeleteMe");
        });

        test('should fetch an array of users without error', async () => {
            let users = await db.fetchUsersWithId();
            assert.strictEqual(users.length > 0, true,"Fetched unexpected number of users.");
            let baseLineLen = users.length;
            await db.getPromise(db.insertUser,{accountId:"testDeleteMeInsert",familyName:"LastTest", givenName:"FirstTest"});
            //fetch the users again
            users = await db.fetchUsersWithId();
            assert.strictEqual(users.length, baseLineLen + 1, true,"Post insert, unexpected number of users.");
            assert.strictEqual(users[baseLineLen].accountId === "testDeleteMeInsert", true,"Last user is not the user just inserted");
            //delete the user
            await db.getPromise(db.deleteUser, "testDeleteMeInsert");
            //fetch the users again
            users = await db.fetchUsersWithId();
            assert.strictEqual(users.length, baseLineLen, true,"Post delete, unexpected number of users.");
        });

    });

    describe('Team',()=>{

        beforeAll(async()=>{
            await db.getConn().query("DELETE FROM teams WHERE name like '%Delete%'");
            await db.getPromise(db.insertUser,{accountId:"testDeleteMe1",familyName:"LastTest1", givenName:"FirstTest1"});
            await db.getPromise(db.insertUser,{accountId:"testDeleteMe2",familyName:"LastTest2", givenName:"FirstTest2"});

        });

        test('should create a team without error', async() => {
            let user = await db.getPromise(db.getUser,"testDeleteMe1"); 
            assert(user!=null,"Error with test setup. Owner user is null");

            await db.getPromise(db.insertTeam,[user,{name:"testTeamDeleteMe"}]);

        });


        test('should fetch an array of teams without error', function(done) {
            db.fetchTeams(
            function(err){
                done(err);
            },function(result){ 
                assert(result.length > 0,"Team result Array is 0 or null.");
                done();
            });
        });



        test('should fetch a team by name without error', function(done) {
            db.getTeamWithMembersByName("testTeamDeleteMe",
            function(err){
                done(err);
            },function(team){ 
                assert.equal(team.members[0].givenName,"FirstTest1","Expected user not part of the team");
                done();
            });
        });


        test('should fetch a team by id without error', async() => {
            let team1 = await db.getPromise(db.getTeamWithMembersByName,"testTeamDeleteMe");
            let team2 = await db.getPromise(db.getTeamById,team1.id);
            assert(team1.id===team2.id,"Team ids don't match!"); 
        });

        test('should get the team stats without error', async () => {
            let promise = db.getTeamStats(null);
            let result = await promise;
            assert(result!==null,"Result should not be null");
            assert(result.length > 0 ,"Result should have more than 0 rows");
            return promise;
        });

    });

    describe('#getTeamMembersByBadges(), #getModuleStats()', () => {
        var team = null;
        var users = [];
        const USER_COUNT = 5;
        beforeAll(async () => {
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

        test('should get the module stats without error', async () =>{
            let promise = db.getModuleStats();
            let result = await promise;
            assert(result!==null,"Result should not be null");
            assert(result.length > 0 ,"Result should have more than 0 rows");
            return promise;
        });
    
        test('should get the team members by badges without error', async () => {
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

        test('should get the team members by badges without error', async () => {
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
        
        
        test('should get the team members by badge in the last days count', async () => {
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

        test('should get the all users with badges for a particular module id without error', async () => {
            let promise = db.getAllUsersForBadge("blackBelt");
            let result = await promise;
            assert.notStrictEqual(result, null,"Result should not be null");
            assert(result.length >= 1, "Result should have at least 1 row"  );

            let filter = result.filter(user => user.givenName.indexOf("BadgeTeam") > -1);

            assert.strictEqual(filter.length,USER_COUNT-1,`There should be at least '${USER_COUNT-1}' blackBelts`);

            return promise;
        });

        afterAll(async () => {
            for(let user of users){
                await db.getConn().queryPromise("DELETE FROM users WHERE id = ?",[user.id]);
                await db.getConn().queryPromise("DELETE FROM badges WHERE userId = ?",[user.id]);
            }
            return db.getConn().queryPromise("DELETE FROM teams WHERE id = ?",[team.id]);

        });
    });

    afterAll(async () => {
        await db.getConn().queryPromise("DELETE FROM users WHERE accountId like '%Delete%'");
        await db.getConn().queryPromise("DELETE FROM teams WHERE name like '%Delete%'");
    });

    describe('#deleteTeam()', () => {
        test('should delete a team without error', async() => {
            let team = await db.getPromise(getTeamWithMembersByName,"testTeamDeleteMe");
            await db.getPromise(db.deleteTeam,[{id:team.ownerId},team.id]);
            team = await db.getPromise(getTeamWithMembersByName,"testTeamDeleteMe");
            assert(team===null,"Team not deleted");
        });
    });

    describe('#insertChallengeEntry(),#fetchChallengeEntriesForUser(),#fetchActivity(),#getChallengeStats()', () => {

        var user = null;
        beforeAll(async () => {
            await db.getPromise(db.insertUser,{accountId:"testDeleteMeChallenges",familyName:"LastTest1", givenName:"FirstTest1"});
            user = await db.getPromise(db.getUser,"testDeleteMeChallenges");
        });


        test('should insert a challenge entry without error', async () => {
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe306"]);
            let challenges = await db.fetchChallengeEntriesForUser(user);
            assert.equal(challenges.length,1,"Incorrect number of entries for user");
            assert.equal(challenges[0].challengeId,"cwe306","Incorrect challenge entry id for user");                                
            assert.notEqual(challenges[0].timestamp,null,"Timestamp should not be null");  
        });

        test('should get the correct number of activities', async () => {
            let promise = db.getPromise(db.fetchActivity, [user.givenName,10]);
            let result = await promise;
            assert.equal(result.length,1,"Incorrect number of activity entries for user");
            return promise;
        });

        test('should get the challenge stats without error', async () => {
            let promise = db.getPromise(db.getChallengeStats);
            let result = await promise;

            assert(result!==null,"Result should not be null");
            assert(result.length > 0 ,"Result should have more than 0 rows");

            return promise;
        });

        afterAll(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE id=?",[user.id]);
            await db.getConn().queryPromise("DELETE FROM badges WHERE userId=?",[user.id]);
            return db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId=?",[user.id]);
        })
    });

    describe('getModuleVersion,updateModuleVersion', () => {

        test('should get a training modules version greater than -1', async () => {
            let result = await db.getModuleVersion();
            assert(result>-1,"Result should be 0 or higher");
        });

        test('should update the training modules version', async () => {
            let ver = await db.getModuleVersion();
            let expected = 999;
            await db.updateModuleVersion(expected);
            let test = await db.getModuleVersion();
            assert.strictEqual(test,expected,"Module version update failed.");
            await db.updateModuleVersion(ver);
        });
      
    });


});


