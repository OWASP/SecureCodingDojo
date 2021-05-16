/**

Copyright 2017-2018 Trend Micro

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 */
const assert = require('assert');
const crypto = require('crypto');

const db = require('../db');
const util = require('../util');
var challenges = require('../challenges');
const { info } = require('console');
var badgrCount = 0;

//mock the badgr call
challenges.badgrCall = function(badgrInfo, user){
    badgrCount++;    
};

//mock request and response express objects
var lastChallengeId = "cwe862";

//calculate the hash
var mockSalt = "1234";
var masterSalt = "";
if(util.isNullOrUndefined(process.env.CHALLENGE_MASTER_SALT)){
    util.log("WARNING. CHALLENGE_MASTER_SALT not set. Challenges may be bypassed.");
}
else{
    masterSalt=process.env.CHALLENGE_MASTER_SALT;
}


var mockHash = crypto.createHash('sha256').update(lastChallengeId+mockSalt+masterSalt).digest('base64');

var mockRequest = {
    "body":{
        "challengeId":lastChallengeId,
        "moduleId":"blackBelt",
        "challengeCode":mockHash
    },
    "user":{
        "givenName":"MockGivenName",
        "familyName":"MockFamilyName",
        "codeSalt":mockSalt
    }
};

var mockResponse = {
    "send":function(data){
        console.log(`Response sent:${data}`);
    }
};



describe('challengeTests', function() {
    var user = null;

    before(async () => {
        await db.getPromise(db.deleteUser,"levelUpUser");
        await db.getPromise(db.deleteUser,"apiChallengeCodeUser");
        await db.getPromise(db.insertUser,{accountId:"levelUpUser",familyName:"LastLevelUp", givenName:"FirstLevelUp"});
        let promise = db.getPromise(db.getUser,"levelUpUser");
        user = await promise;
        return promise;
    });

    describe('#isPermittedModule()', async () => {
        it('should return false for seconDegreeBlackBelt', async () => {
            assert.notEqual(user, null, "Failed test setup - user null");
            let promise = challenges.isPermittedModule(user,"secondDegreeBlackBelt");
            permitted = await promise;
            assert.equal(permitted,false,"Shouldn't not be permitted");
            return promise;
        });
    });


  
    describe('#verifyModuleCompletion() - issue badge', async () => {
        var user = null;
        before(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE accountId='secondDegreeUser'");
            await db.getPromise(db.insertUser,{accountId:"secondDegreeUser",familyName:"LastLevelUp", givenName:"FirstLevelUp"});
            user = await db.getPromise(db.getUser,"secondDegreeUser");
            await db.getPromise(db.insertChallengeEntry,[user.id, "owasp2017misconfig"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "owasp2017sensitive"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "owasp2017brokenauth"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "owasp2017xss"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "owasp2017injection"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "owasp2017xxe"]);
            return db.getPromise(db.insertChallengeEntry,[user.id, "owasp2017deserialization"]);

        });

        it('should  issue a badge', async () => {
            
            let result = await challenges.verifyModuleCompletion(user, "secondDegreeBlackBelt");
            assert.equal(result,true,"Should have completed the module");
            let promise = db.fetchBadges(user.id);
            let badges = await promise;
            assert.notEqual(null, badges, "badges should NOT be null");
            assert.equal(badges.length, 1, "Incorrect number of badges");
            assert.equal(badges[0].moduleId, "secondDegreeBlackBelt", "Wrong badge module");
            //cleanup
            return promise;
        });

        after(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE id=?",[user.id]);
            await db.getConn().queryPromise("DELETE FROM badges WHERE userId=?",[user.id]);
            return db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId=?",[user.id]);
        });
    });

    describe('#getUserLevelForModule()', async () => {
        var user = null;
        before(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE accountId='deleteMe_getUserLevelForModule'");
            await db.getPromise(db.insertUser,{accountId:"deleteMe_getUserLevelForModule",familyName:"Last", givenName:"First"});
            user = await db.getPromise(db.getUser,"deleteMe_getUserLevelForModule");
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe306"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe807"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe862"]);
            return db.getPromise(db.insertChallengeEntry,[user.id, "cwe311"]);
        });

        it('should be at the correct level for module', async () => {
            
            let promise = challenges.getUserLevelForModule(user, "blackBelt");
            let result = await promise;
            assert.equal(result,1,"Should be at level 1");
            //cleanup
            return promise;
        });

        after(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE id=?",[user.id]);
            return db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId=?",[user.id]);
        });
    });

    describe('#getBadgeCode(),verifyBadgeCode',  () => {
        it('should generate correct badge code',  () => {
            
            let badgeCode = challenges.getBadgeCode({id:26,
                  moduleId:'blackBelt',
                  timestamp:'Thu Feb 11 2021 22:43:31 GMT-0500 (Eastern Standard Time)',
                  userId:92
              }, user);
              //verify badge code
              assert.notEqual(null, badgeCode, "badge code should not be null")
              let uriDecoded = decodeURIComponent(badgeCode);
              let parts = uriDecoded.split(".");
              assert.equal(2,parts.length,"badge code should be split by .");
              //verify the hash matches
              let infoHash = crypto.createHash('sha256').update(parts[0]+masterSalt).digest('base64');
              assert.equal(infoHash, parts[1]);
              let decoded = Buffer.from(parts[0],"Base64").toString();
              let parsed = JSON.parse(decoded);
              assert.notEqual(null, parsed.badgeInfo, "code.info.badgeInfo should not be null")
              assert.notEqual(null, parsed.givenName, "code.info.givenName should not be null")
              assert.notEqual(null, parsed.familyName, "code.info.firstName should not be null")
  
        });

        it('should verify correct badge code',  () => {
        
            let parsed = challenges.verifyBadgeCode("eyJiYWRnZUluZm8iOnsibGluZTEiOiJTZWN1cmUgQ29kaW5nIiwibGluZTIiOiJCbGFjayBCZWx0IiwiYmciOiJibGFjayJ9LCJnaXZlbk5hbWUiOiJGaXJzdExldmVsVXAiLCJmYW1pbHlOYW1lIjoiTGFzdExldmVsVXAiLCJjb21wbGV0aW9uIjoiVGh1IEZlYiAxMSAyMDIxIDIyOjQzOjMxIEdNVC0wNTAwIChFYXN0ZXJuIFN0YW5kYXJkIFRpbWUpIiwiaWRIYXNoIjoiOGQyN2JhMzdjNSJ9.309a1/l6E5rEE1IZ9P1Z/1MAUE+MbqbX19VIZ2+jp54=");
            
            assert.notEqual(null, parsed.badgeInfo, "code.info.badgeInfo should not be null")
            assert.notEqual(null, parsed.givenName, "code.info.givenName should not be null")
            assert.notEqual(null, parsed.familyName, "code.info.firstName should not be null")

        });

        it('should return null on wrong hash',  () => {
        
            let parsed = challenges.verifyBadgeCode("eyJiYWRnZUluZm8iOnsibGluZTEiOiJTZWN1cmUgQ29kaW5nIiwibGluZTIiOiJCbGFjayBCZWx0IiwiYmciOiJibGFjayJ9LCJnaXZlbk5hbWUiOiJGaXJzdExldmVsVXAiLCJmYW1pbHlOYW1lIjoiTGFzdExldmVsVXAiLCJjb21wbGV0aW9uIjoiVGh1IEZlYiAxMSAyMDIxIDIyOjQzOjMxIEdNVC0wNTAwIChFYXN0ZXJuIFN0YW5kYXJkIFRpbWUpIiwiaWRIYXNoIjoiOGQyN2JhMzdjNSJ9.XYZ");
            
            assert.equal(null, parsed, "Expected null on wrong code")

        });
    });

    describe('#apiChallengeCode', async () => {
        var user = null;
        before(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE accountId='deleteMe_apiChallengeCode'");
            await db.getPromise(db.insertUser,{accountId:"deleteMe_apiChallengeCode",familyName:"Last", givenName:"First"});
            let promise = db.getPromise(db.getUser,"deleteMe_apiChallengeCode");
            user = await promise;
            return promise;
        });
        
        it('should return invalid request if fields are missing',async () => {
            let promise = challenges.apiChallengeCode({"body":{}});
            try{
                await promise;
            }
            catch(err){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.message,"invalidRequest","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok");});
            }
            return promise;
        });

        it('should return invalid code if code is invalid',async () => {
            let promise = challenges.apiChallengeCode({"body":{"moduleId":"blackBelt","challengeCode":"<script>","challengeId":"ABC"}});
            try{
                await promise;
            }
            catch(err){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.message,"invalidCode","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok");});
            }
            return promise;
        });

        it('should return invalid challenge id if challenge id is invalid',async () => {
            let promise = challenges.apiChallengeCode({"body":{"moduleId":"blackBelt","challengeCode":"QUJDCg==","challengeId":"<script>"}});
            try{
                await promise;
            }
            catch(err){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.message,"invalidChallengeId","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok");});
            }
            return promise;

        });

        it('should return invalid module id if module id is invalid',async () => {
            let promise = challenges.apiChallengeCode({"body":{"moduleId":"blackBelt<script>","challengeCode":"QUJDCg==","challengeId":"<script>"}});
            try{
                await promise;
            }
            catch(err){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.message,"invalidModuleId","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok");});
            }
            return promise;
        });

        it('should return challenge not available for incorrect user level',async () => {
            let promise = challenges.apiChallengeCode({
                "user":user,
                "body":
                    {
                        "moduleId":"blackBelt",
                        "challengeCode":"QUJDCg==",
                        "challengeId":"cwe79"
                    }
            });

            try{
                await promise;
            }
            catch(err){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.message,"challengeNotAvailable","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok");});

            }
            return promise;

        });

        it('should return challenge not found for incorrect user level',async () => {
            let promise = challenges.apiChallengeCode(
                {
                    "user":user,
                    "body":
                        {
                            "moduleId":"blackBelt",
                            "challengeCode":"QUJDCg==",
                            "challengeId":"cwe79"
                        }
                });
            try{
                await promise;
            }
            catch(err){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.message,"challengeNotAvailable","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok");});
            }
            return promise;    
        });

        it('should return invalid code for wrong hash',async () => {
            let promise = challenges.apiChallengeCode(
                {
                    "user":user,
                    "body":
                        {
                            "moduleId":"blackBelt",
                            "challengeCode":"QUJDCg==",
                            "challengeId":"cwe807"
                        }
                });
                
            try{
                await promise;
            }
            catch(err){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.message,"invalidCode","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok");});
            }
            return promise;      
        });


        it('should return updated level for user', async () => {
            await db.getPromise(db.insertChallengeEntry, [user.id, "cwe306"]);
            await db.getPromise(db.insertChallengeEntry, [user.id, "cwe807"]);
            user.codeSalt = mockSalt;
            mockRequest.user = user;
            await challenges.apiChallengeCode(mockRequest);
            let promise = challenges.getUserLevelForModule(user,"blackBelt");
            let level = await promise;
            assert.equal(level,1,"Wrong level for module");
            return promise;
        });

        after(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE id=?",[user.id]);
            return db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId=?",[user.id]);
        });
    });

    after(async () =>{
       
        var user1 = await db.getPromise(db.getUser,"levelUpUser");
        await db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId = ?",[user1.id]);
        await db.getPromise(db.deleteUser,"levelUpUser");
        var promise = db.getPromise(db.deleteUser,"apiChallengeCodeUser");
        await promise;
        return promise;

    });

});

