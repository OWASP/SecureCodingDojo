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
const async = require('async');
const assert = require('assert');
const crypto = require('crypto');

const db = require('../db');
const util = require('../util');
const aescrypto = require('../aescrypto');
var challenges = require('../challenges');
var badgrCount = 0;

//mock the badgr call
challenges.badgrCall = function(badgrInfo, user){
    badgrCount++;    
}

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
}

var mockResponse = {
    "send":function(data){
        console.log(`Response sent:${data}`);
    }
}


describe('challengeTests', function() {
    
    before(function(){
        async.waterfall([
            function (cb){
                db.deleteUser("levelUpUser",function(err){cb(err);},function(result){cb(null,result);});
            },                
            function (result, cb){
                db.deleteUser("apiChallengeCodeUser",function(err){cb(err);},function(result){cb(null,result);});
            }
        ],function(err){
            if(err) throw new Error(err);
        });
    });

    describe('#verifyLevelUp() - no challenges', async () => {
        it('should fail to level up without challenges', async () => {
            await db.getPromise(db.insertUser,{accountId:"levelUpUser",familyName:"LastLevelUp", givenName:"FirstLevelUp"});
            let user = await db.getPromise(db.getUser,"levelUpUser");
            assert.notEqual(user, null, "Failed test setup - user null");
            let promise = challenges.verifyLevelUp(user, "blackBelt");
            let result = await promise;
            assert.notEqual(result,true,"Shouldn't have leveled up");
            return promise;
        });
    });

    describe('#verifyLevelUp() - insufficient challenges', async () => {
        it('should fail to level up with only two challenges', async () => {
            let user = await db.getPromise(db.getUser,"levelUpUser");
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe306"]);
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe807"]);
            let promise = challenges.verifyLevelUp(user, "blackBelt");
            let result = await promise;
            assert.notEqual(result,true,"Shouldn't have leveled up");
            return promise;
        });
    });

    

    describe('#verifyLevelUp() - level up case', async () => {
        it('should level up', async () => {
            let user = await db.getPromise(db.getUser,"levelUpUser");
            await db.getPromise(db.insertChallengeEntry,[user.id, "cwe862"]);
            let result = await challenges.verifyLevelUp(user, "blackBelt");
            assert.equal(result,true,"Should have leveled up");
            user = await db.getPromise(db.getUser,"levelUpUser");;
            assert.equal(user.level, 1, "User level not updated");
            let promise = db.fetchBadges(user.accountId);
            let badge = await promise;
            assert.notEqual(badge, null, "badge should NOT be null");
            assert.equal(badge, 0, "badges should be 0");
            return promise;
        });
    });

    describe('#verifyLevelUp() - completed module', async () => {
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
            await db.getPromise(db.insertChallengeEntry,[user.id, "owasp2017deserialization"]);

            user.level = 7;
            return db.getPromise(db.updateUser, user);
        });

        it('should level up and issue a badge', async () => {
            
            let result = await challenges.verifyLevelUp(user, "secondDegreeBlackBelt");
            assert.equal(result,true,"Should have leveled up");
            user = await db.getPromise(db.getUser,user.accountId);;
            assert.equal(user.level, 8, "User level not updated");
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
        })
    });


    describe('#apiChallengeCode', async () => {
        
        it('should return invalid request if fields are missing',async () => {
            let promise = challenges.apiChallengeCode({"body":{}});
            try{
                await promise;
            }
            catch(err){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.message,"invalidRequest","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok")});
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
                promise = new Promise((resolve)=>{resolve("ok")});
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
                promise = new Promise((resolve)=>{resolve("ok")});
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
                promise = new Promise((resolve)=>{resolve("ok")});
            }
            return promise;
        });

        it('should return wrong level for incorrect user level',async () => {
            let promise = challenges.apiChallengeCode({
                "user":{level:20},
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
                assert.equal(err.message,"wrongLevel","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok")});

            }
            return promise;

        });

        it('should return challenge not found for incorrect user level',async () => {
            let promise = challenges.apiChallengeCode(
                {
                    "user":{level:0},
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
                assert.equal(err.message,"challengeNotFound","Wrong error code returned");
                promise = new Promise((resolve)=>{resolve("ok")});
            }
            return promise;    
        });

        it('should return invalid code for wrong hash',async () => {
            let promise = challenges.apiChallengeCode(
                {
                    "user":{level:0},
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
                promise = new Promise((resolve)=>{resolve("ok")});
            }
            return promise;      
        });


        it('should level up user and call badgr', async () => {
            await db.getPromise(db.insertUser,{
                accountId:"apiChallengeCodeUser",
                familyName:"LastApiChallengeCode", 
                givenName:"FirstApiChallengeCode"
            });
            let user = await db.getPromise(db.getUser,"apiChallengeCodeUser");
            await db.getPromise(db.insertChallengeEntry, [user.id, "cwe306"]);
            await db.getPromise(db.insertChallengeEntry, [user.id, "cwe807"]);
            user.codeSalt = mockSalt;
            mockRequest.user = user;
            let promise = await challenges.apiChallengeCode(mockRequest);
            assert.equal(mockRequest.user.level,1,"User level did not update");
            assert.equal(badgrCount,2,"Badgr not called");
            return promise;
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
            function (user,cb){
                db.getConn().query("DELETE FROM challengeEntries WHERE userId = ?",[user.id],
                    function(err, result){
                        if(err)  cb(err);
                        else cb(null,result);
                    });
            },
            function (result,cb){
                db.getUser("apiChallengeCodeUser",
                    function(err){
                        cb(err);
                    },function(user){ 
                        cb(null,user);
                    });
            },
            function(user,cb){
                db.getConn().query("DELETE FROM challengeEntries WHERE userId = ?",[user.id],
                function(err, result){
                    if(err)  cb(err);
                    else cb(null,result);
                });
            },
            function (result,cb){
                db.deleteUser("levelUpUser",
                function(err){
                    cb(err);
                },function(result){ 
                    cb(null,null);
                }); 
            },
            function (result,cb){
                db.deleteUser("apiChallengeCodeUser",
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

