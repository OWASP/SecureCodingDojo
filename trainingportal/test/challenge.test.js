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
process.env.CHALLENGE_MASTER_SALT = "5679"

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
var lastChallengeId = "cwe798";

//calculate the hash
var mockSalt = "1234";
masterSalt=process.env.CHALLENGE_MASTER_SALT;
var mockHash = crypto.createHash('sha256').update(lastChallengeId+mockSalt+masterSalt).digest('base64');

var mockRequest = {
    "body":{
        "challengeId":lastChallengeId,
        "moduleId":"greenBelt",
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





describe('challengeTests', () => {
    var user = null;

    beforeAll(async () => {

        await db.getPromise(db.deleteUser,"levelUpUser");
        await db.getPromise(db.deleteUser,"apiChallengeCodeUser");
        await db.getPromise(db.insertUser,{accountId:"levelUpUser",familyName:"LastLevelUp", givenName:"FirstLevelUp"});
        let promise = db.getPromise(db.getUser,"levelUpUser");
        user = await promise;
        return promise;
    });

   

    describe('#isPermittedModule()', () => {
        test('should return false for secondDegreeBlackBelt', async () => {
            assert.notStrictEqual(user, null, "Failed test setup - user null");
            let promise = challenges.isPermittedModule(user,"secondDegreeBlackBelt");
            permitted = await promise;
            assert.strictEqual(permitted,false,"Shouldn't not be permitted");
            return promise;
        });
    });

    describe('#getChallengeDefinitions()', () => {
        test('should return a non-zero count of challenges for securityCodeReviewMaster', async () => {
            let defs = await challenges.getChallengeDefinitions("securityCodeReviewMaster");
            assert(defs.length > 0,"Unexpected number of challenges returned for securityCodeReviewMaster");
        });
        test('should return a 0 count of challenges for nonExistentModule', async () => {
            let defs = await challenges.getChallengeDefinitions("nonExistentModule");
            assert(defs.length === 0,"Unexpected number of challenges returned for nonExistentModule");
        });
    });

  
    describe('#verifyModuleCompletion() - issue badge', () => {
        var user = null;
        beforeAll(async ()=>{
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

        test('should  issue a badge', async () => {
            
            let result = await challenges.verifyModuleCompletion(user, "secondDegreeBlackBelt1");
            assert.strictEqual(result,true,"Should have completed the module");

            result = await challenges.verifyModuleCompletion(user, "secondDegreeBlackBelt2");
            assert.strictEqual(result,true,"Should have completed the module");

            let promise = db.fetchBadges(user.id);
            let badges = await promise;
            assert.notStrictEqual(null, badges, "badges should NOT be null");
            assert.strictEqual(badges.length, 2, "Incorrect number of badges");
            assert.strictEqual(badges[0].moduleId, "secondDegreeBlackBelt1", "Wrong badge module");
            assert.strictEqual(badges[1].moduleId, "secondDegreeBlackBelt2", "Wrong badge module");
            //cleanup
            return promise;
        });

        afterAll(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE id=?",[user.id]);
            await db.getConn().queryPromise("DELETE FROM badges WHERE userId=?",[user.id]);
            return db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId=?",[user.id]);
        });
    });

    describe('#getUserLevelForModule()', () => {
        var user = null;
        beforeAll(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE accountId='deleteMe_getUserLevelForModule'");
            await db.getPromise(db.insertUser,{accountId:"deleteMe_getUserLevelForModule",familyName:"Last", givenName:"First"});
            user = await db.getPromise(db.getUser,"deleteMe_getUserLevelForModule");
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe807"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe862"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe306"]);
            return db.getPromise(db.insertChallengeEntry,[user.id, "cwe798"]);

        });

        test('should be at the correct level for module', async () => {
            
            let promise = challenges.getUserLevelForModule(user, "greenBelt");
            let result = await promise;
            assert.strictEqual(result,1,"Should be at level 1");
            //cleanup
            return promise;
        });

        afterAll(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE id=?",[user.id]);
            return db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId=?",[user.id]);
        });
    });

    describe('#getBadgeCode(),verifyBadgeCode', () => {
        test('should generate correct badge code',  () => {
            
            let badgeCode = challenges.getBadgeCode({id:26,
                  moduleId:'blackBelt',
                  timestamp:'Thu Feb 11 2021 22:43:31 GMT-0500 (Eastern Standard Time)',
                  userId:92
              }, user);
              //verify badge code
              assert.notStrictEqual(null, badgeCode, "badge code should not be null")
              let uriDecoded = decodeURIComponent(badgeCode);
              let parts = uriDecoded.split(".");
              assert.strictEqual(2,parts.length,"badge code should be split by .");
              //verify the hash matches
              let infoHash = crypto.createHash('sha256').update(parts[0]+masterSalt).digest('base64');
              assert.strictEqual(infoHash, parts[1]);
              let decoded = Buffer.from(parts[0],"Base64").toString();
              let parsed = JSON.parse(decoded);
              assert.notStrictEqual(null, parsed.badgeInfo, "code.info.badgeInfo should not be null")
              assert.notStrictEqual(null, parsed.givenName, "code.info.givenName should not be null")
              assert.notStrictEqual(null, parsed.familyName, "code.info.firstName should not be null")
  
        });

        test('should verify correct badge code', () => {
            let badgeCode = challenges.getBadgeCode({id:26,
                moduleId:'blackBelt',
                timestamp:'Thu Feb 11 2021 22:43:31 GMT-0500 (Eastern Standard Time)',
                userId:92
            }, user);

            let parsed = challenges.verifyBadgeCode(badgeCode);
            
            assert.notStrictEqual(null, parsed.badgeInfo, "code.info.badgeInfo should not be null")
            assert.notStrictEqual(null, parsed.givenName, "code.info.givenName should not be null")
            assert.notStrictEqual(null, parsed.familyName, "code.info.firstName should not be null")

        });

        test('should return null on wrong hash', () => {
        
            let parsed = challenges.verifyBadgeCode("eyJiYWRnZUluZm8iOnsibGluZTEiOiJTZWN1cmUgQ29kaW5nIiwibGluZTIiOiJCbGFjayBCZWx0IiwiYmciOiJibGFjayJ9LCJnaXZlbk5hbWUiOiJGaXJzdExldmVsVXAiLCJmYW1pbHlOYW1lIjoiTGFzdExldmVsVXAiLCJjb21wbGV0aW9uIjoiVGh1IEZlYiAxMSAyMDIxIDIyOjQzOjMxIEdNVC0wNTAwIChFYXN0ZXJuIFN0YW5kYXJkIFRpbWUpIiwiaWRIYXNoIjoiOGQyN2JhMzdjNSJ9.XYZ");
            
            assert.strictEqual(null, parsed, "Expected null on wrong code")

        });
    });

    describe('#apiChallengeCode', () => {
        var user = null;
        beforeAll(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE accountId='deleteMe_apiChallengeCode'");
            await db.getPromise(db.insertUser,{accountId:"deleteMe_apiChallengeCode",familyName:"Last", givenName:"First"});
            let promise = db.getPromise(db.getUser,"deleteMe_apiChallengeCode");
            user = await promise;
            return promise;
        });
        
        test('should return invalid request if fields are missing', async () => {
            let error = null
            try{
                await challenges.apiChallengeCode({"body":{}});
            }
            catch(err){
                error = err;
            }
            assert.notStrictEqual(error,null,"Error is null");
            assert.strictEqual(error.message,"invalidRequest","Wrong error code returned");
        });

        test('should return invalid code if code is invalid', async () => {
            let error = null; 
            try{
                await challenges.apiChallengeCode({"body":{"moduleId":"blackBelt","challengeCode":"<script>","challengeId":"ABC"}});
            }
            catch(err){
                error = err;
            }
            assert.notStrictEqual(error,null,"Error is null");
            assert.strictEqual(error.message,"invalidCode","Wrong error code returned");
        });

        test('should return invalid challenge id if challenge id is invalid',async () => {
            let error = null 
            try{
                await challenges.apiChallengeCode({"body":{"moduleId":"blackBelt","challengeCode":"QUJDCg==","challengeId":"<script>"}});
            }
            catch(err){
                error = err;
            }
            assert.notStrictEqual(error,null,"Error is null");
            assert.strictEqual(error.message,"invalidChallengeId","Wrong error code returned");

        });

        test('should return invalid module id if module id is invalid',async () => {
            let promise = challenges.apiChallengeCode({"body":{"moduleId":"blackBelt<script>","challengeCode":"QUJDCg==","challengeId":"<script>"}});
            try{
                await promise;
            }
            catch(err){
                assert.notStrictEqual(err,null,"Error is null");
                assert.strictEqual(err.message,"invalidModuleId","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok");});
            }
            return promise;
        });

        test('should return invalid challenge type for wrong challenge type',async () => {
            let error = null;
            try{
                await challenges.apiChallengeCode({"body":
                    {"moduleId":"blackBelt","challengeCode":"afd","challengeId":"ch1","challengeType":"badType"}});
            }
            catch(err){
                error = err;
            }
            assert.notStrictEqual(error,null,"Error is null");
            assert.strictEqual(error.message,"invalidChallengeType","Wrong error code returned");
        });

        test('should return challenge not available for incorrect user level',async () => {
            let error = null;

            try{
                await challenges.apiChallengeCode({
                    "user":user,
                    "body":
                        {
                            "moduleId":"greenBelt",
                            "challengeCode":"QUJDCg==",
                            "challengeId":"cwe209"
                        }
                });
            }
            catch(err){
                error = err;
            }
            assert.notStrictEqual(error,null,"Error is null");
            assert.strictEqual(error.message,"challengeNotAvailable","Wrong error code returned");
        });

        test('should return challenge not found for incorrect user level',async () => {
            let error = null;
            try{
                await challenges.apiChallengeCode(
                    {
                        "user":user,
                        "body":
                            {
                                "moduleId":"greenBelt",
                                "challengeCode":"QUJDCg==",
                                "challengeId":"cwe79"
                            }
                    });;
            }
            catch(err){
                error = err;
            }
            assert.notStrictEqual(error,null,"Error is null");
            assert.strictEqual(error.message,"challengeNotAvailable","Wrong error code returned");
        });

        test('should return invalid code for wrong hash',async () => {
            let error = null;
                
            try{
                await challenges.apiChallengeCode(
                    {
                        "user":user,
                        "body":
                            {
                                "moduleId":"greenBelt",
                                "challengeCode":"QUJDCg==",
                                "challengeId":"cwe807"
                            }
                    });
            }
            catch(err){
                error = err;
            }
            assert.notStrictEqual(error,null,"Error is null");
            assert.strictEqual(error.message,"invalidCode","Wrong error code returned");
        });

        test('should fail the challenge for wrong answer',async () => {
            let error = null;
            let mockAnswer = "1234";
            let mockAnswerHash = crypto.createHash('sha256').update(mockAnswer+masterSalt).digest('hex');
            let response = null;
                
            try{
                response = await challenges.apiChallengeCode(
                    {
                        "user":user,
                        "body":
                            {
                                "moduleId":"cryptoBreaker",
                                "challengeCode":mockAnswerHash,
                                "challengeId":"crypto_caesar",
                                "challengeType":"quiz",
                                "answer":"wrong"
                            }
                    });;
            }
            catch(err){
                error = err;
            }
            assert.notStrictEqual(error,null,"Error is null");
            assert.strictEqual(error.message,"invalidAnswer","Expected invalidAnswer");
            assert.strictEqual(response,null,"Should fail for wrong answer");

        });

        test('should pass the challenge for correct answer',async () => {
            let mockAnswer = "1234";
            let mockAnswerHash = crypto.createHash('sha256').update(mockAnswer+masterSalt).digest('hex');
            let response = null;
            let error = null;
                
            try{
                response = await challenges.apiChallengeCode(
                    {
                        "user":user,
                        "body":
                            {
                                "moduleId":"cryptoBreaker",
                                "challengeCode":mockAnswerHash,
                                "challengeId":"crypto_caesar",
                                "challengeType":"quiz",
                                "answer":mockAnswer
                            }
                    });
            }
            catch(err){
                error = err;
            }
            assert.strictEqual(error,null,"Error is NOT null");
            assert.strictEqual(response.data.id, "crypto_caesar", "Wrong challenge id.")
        });



        test('should return updated level for user', async () => {
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe807"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe862"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe306"]);

            user.codeSalt = mockSalt;
            mockRequest.user = user;
            await challenges.apiChallengeCode(mockRequest);
            let promise = challenges.getUserLevelForModule(user,"greenBelt");
            let level = await promise;
            assert.strictEqual(level,1,"Wrong level for module");
            return promise;
        });

        afterAll(async ()=>{
            //cleanup
            await db.getConn().queryPromise("DELETE FROM users WHERE id=?",[user.id]);
            return db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId=?",[user.id]);
        });
    });

    afterAll(async () =>{
       
        var user1 = await db.getPromise(db.getUser,"levelUpUser");
        await db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId = ?",[user1.id]);
        await db.getPromise(db.deleteUser,"levelUpUser");
        var promise = db.getPromise(db.deleteUser,"apiChallengeCodeUser");
        await promise;
        return promise;

    });

});

