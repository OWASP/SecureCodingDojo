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
var challengeSecrets = challenges.getChallengeSecrets();
var secretEntry = challengeSecrets[lastChallengeId];
if(util.hasKey()){
    secretEntry = aescrypto.decrypt(secretEntry,process.env.CHALLENGE_KEY,process.env.CHALLENGE_KEY_IV);
}
//calculate the hash
var mockSalt = "1234";
var masterSalt = "";
if(util.isNullOrUndefined(process.env.CHALLENGE_MASTER_SALT)){
    util.log("WARNING. CHALLENGE_MASTER_SALT not set. Challenges may be bypassed.");
}
else{
    masterSalt=process.env.CHALLENGE_MASTER_SALT;
}


var mockHash = crypto.createHash('sha256').update(secretEntry+mockSalt+masterSalt).digest('base64');

var mockRequest = {
    "body":{
        "challengeId":lastChallengeId,
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
                        assert.equal(user.level, 1, "User level not updated");
                        done();
                    });
                }
            ],function(err){
                done(err);
            });
        });
    });

    describe('#apiChallengeCode', function (){
        
        it('should return invalid request if fields are missing',(done) => {
            challenges.apiChallengeCode({"body":{}},function(err,result){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.code,"invalidRequest","Wrong error code returned");
                done();
            })
        });

        it('should return invalid code if code is invalid',(done) => {
            challenges.apiChallengeCode({"body":{"challengeCode":"<script>","challengeId":"ABC"}},function(err,result){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.code,"invalidCode","Wrong error code returned");
                done();
            })
        });

        it('should return invalid id if challenge id is invalid',(done) => {
            challenges.apiChallengeCode({"body":{"challengeCode":"QUJDCg==","challengeId":"<script>"}},function(err,result){
                assert.notEqual(err,null,"Error is null");
                assert.equal(err.code,"invalidId","Wrong error code returned");
                done();
            })
        });

        it('should return wrong level for incorrect user level',(done) => {
            challenges.apiChallengeCode(
                {
                    "user":{level:20},
                    "body":
                        {
                            "challengeCode":"QUJDCg==",
                            "challengeId":"cwe79"
                        }
                },function(err,result){
                    assert.notEqual(err,null,"Error is null");
                    assert.equal(err.code,"wrongLevel","Wrong error code returned");
                    done();
                })
        });

        it('should return challenge not found for incorrect user level',(done) => {
            challenges.apiChallengeCode(
                {
                    "user":{level:0},
                    "body":
                        {
                            "challengeCode":"QUJDCg==",
                            "challengeId":"cwe79"
                        }
                },function(err,result){
                    assert.notEqual(err,null,"Error is null");
                    assert.equal(err.code,"challengeNotFound","Wrong error code returned");
                    done();
                })
        });

        it('should return invalid code for wrong hash',(done) => {
            challenges.apiChallengeCode(
                {
                    "user":{level:0},
                    "body":
                        {
                            "challengeCode":"QUJDCg==",
                            "challengeId":"cwe807"
                        }
                },function(err,result){
                    assert.notEqual(err,null,"Error is null");
                    assert.equal(err.code,"invalidCode","Wrong error code returned");
                    done();
                })
        });


        it('should level up user and call badgr', function(done) {
            async.waterfall([              
                function (cb){
                    db.insertUser(
                        {
                            accountId:"apiChallengeCodeUser",
                            familyName:"LastApiChallengeCode", 
                            givenName:"FirstApiChallengeCode"
                        },
                    function(err){
                        cb(err);
                    },function(result){
                        cb(null,result);
                    });
                },
                function (response, cb){
                    db.getUser("apiChallengeCodeUser",
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
                    user.codeSalt = mockSalt;
                    mockRequest.user = user;
                    challenges.apiChallengeCode(mockRequest,
                        (err,result) => {
                            if(err) cb(err);
                            else{
                                assert.equal(mockRequest.user.level,1,"User level did not update");
                                assert.equal(badgrCount,2,"Badgr not called");
                                done();
                            }
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

