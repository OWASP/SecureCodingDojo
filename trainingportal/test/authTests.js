/*
    Copyright 2021 VMware, Inc.
    SPDX-License-Identifier: Apache-2.0	
*/
const assert = require('assert');

const db = require('../db');
const auth = require("../auth");
const util = require("../util");
var config = util.getConfig();
config.allowedAccountPattern = "authTest.*";


describe('authTests', () => {
    

    before(async () => {
        await db.getConn().queryPromise("DELETE FROM users WHERE accountId LIKE ?",["authTest%"]);
        await db.getConn().queryPromise("DELETE FROM teams WHERE name LIKE ?",["authTest%"]);
    });
  
    describe('#processAuthCallback', async () => {

        var teamOwner = null;
        var team = null;

        before(async () => {


            await db.getPromise(db.insertUser,{accountId:"authTestTeamOwner",familyName:"Owner", givenName:"Team"});
            teamOwner = await db.getPromise(db.getUser,"authTestTeamOwner");
            await db.getPromise(db.insertTeam,[teamOwner,{name:"authTestTeam"}]);
            team = await db.getPromise(db.getTeamWithMembersByName,"authTestTeam");
        });
       
        it('should create a new user without a team', async () => {
            await db.getConn().queryPromise("DELETE FROM users WHERE accountId = ?",["authTestUser"]);

            config.defaultTeam = null;
            var promise = new Promise((resolve,reject)=>{
                auth.processAuthCallback("authTestUser","Auth Test","User","authtestuser@email.local", (e, u) => {
                    resolve(u);
                });
            });

            let newUser = await promise;
            assert.strictEqual(newUser.accountId,"authTestUser");
            assert.strictEqual(newUser.teamId, null, "Expected team id doesn't match");

            return promise;
        });

        it('should create a new user and assign it to the default team', async () => {
            await db.getConn().queryPromise("DELETE FROM users WHERE accountId = ?",["authTestUser"]);
            config.defaultTeam = "authTestTeam";
            var promise = new Promise((resolve,reject)=>{
                auth.processAuthCallback("authTestUser","Auth Test","User","authtestuser@email.local", (e, u) => {
                    resolve(u);
                });
            });

            let newUser = await promise;
            assert.strictEqual(newUser.accountId,"authTestUser");
            assert.strictEqual(newUser.teamId, team.id, "Expected team id doesn't match");

            return promise;
        });

        it('should retrieve and return an existing user', async () => {
            await db.getConn().queryPromise("DELETE FROM users WHERE accountId = ?",["authTestUser"]);
            config.defaultTeam = "someOtherTeam";
            var promise = new Promise((resolve,reject)=>{
                auth.processAuthCallback("authTestTeamOwner","Team","Owner","teamowner@email.local", (e, u) => {
                    resolve(u);
                });
            });

            let newUser = await promise;
            assert.strictEqual(newUser.accountId,"authTestTeamOwner");
            assert.strictEqual(newUser.teamId, team.id, "Expected team id doesn't match");

            return promise;
        });

        it('should reject a profileId if is not allowed', async () => {
            var promise = new Promise((resolve,reject)=>{
                auth.processAuthCallback("userNotMatchingAllowedPattern","A","B","c@email.local", (e, u) => {
                    resolve(e);
                });
            });

            let error = await promise;
            assert.strictEqual(error.message,"Profile id not allowed:userNotMatchingAllowedPattern");

            return promise;
        });

        after(async () => {
            await db.getPromise(db.deleteTeam,[teamOwner,team.id]);
            await db.getPromise(db.deleteUser,"authTestNewUser");
            await db.getPromise(db.deleteUser,"authTestTeamOwner");

        });
        
    });


    after(async()=>{
        //cleanup
        await db.getConn().queryPromise("DELETE FROM users WHERE accountId LIKE ?",["authTest%"]);
        await db.getConn().queryPromise("DELETE FROM teams WHERE name LIKE ?",["authTest%"]);
        let promise = new Promise((resolve,reject)=>{
            db.getConn().end();
            resolve(null);
        });
        
        return promise;
    });
});
