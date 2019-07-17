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

const db = require('../db');
const util = require('../report');


describe('reportTests', () => {
    
    var user = null;
    var parsedCSV = null;
    before(async () => {
        await db.getPromise(db.deleteUser,"utilUser");
        await db.getPromise(db.insertUser,{accountId:"utilUser",familyName:"LastUtil", givenName:"FirstUtil MiddleUtil"});
        user = await db.getPromise(db.getUser,"utilUser");
        return db.insertBadge(user.id,"blackBelt");
    });
  
    describe('#parseReportCSV', async () => {
       
        it('should parse CSV', async () => {
            var promise = new Promise(function(resolve,reject){
                var csv = "Team1, Team2\nFirstUtil LastUtil, John Smith";
                var data = [];
                for(i=0;i<csv.length;i++) data.push(csv.charCodeAt(i));

                let parsed = util.parseReportCSV(data);
                resolve(parsed);
            });

            parsedCSV = await promise;
            assert.equal(parsedCSV.teamList.length,2,"Expecting 2 teams");
            assert.equal(parsedCSV.totalMembers,2,"Expecting 2 members");
            assert.equal(parsedCSV.teamList[0].team, "Team1","Expecting 'Team1' for the first team");
            assert.equal(parsedCSV.teamList[0].members.length,1,"Expecting 1 member per team");
            assert.equal(parsedCSV.teamList[0].members[0].name,"FirstUtil LastUtil","Expecting 'FirstUtil LastUtil' in Team 1");
            return promise;
        });
        
    });

    describe('#getReportForModuleId', async () => {
       
        it('should get an accurate report', async () => {
            var promise = util.getReportForModuleId(parsedCSV, "blackBelt");

            let result = await promise;
            assert.notEqual(result,null,"Result should not be null");
            assert.equal(result.status,200,"Expecting status 200");
            assert.equal(result.totalMembers,2,"Expecting 2 members");
            assert.equal(result.completeMembers,1,"Expecting 1 member with complete status");
            assert.equal(result.incompleteMembers,1,"Expecting 1 member with incomplete status");
            assert.equal(result.percentComplete,50,"Expecting 50% complete");
            assert.equal(parsedCSV.teamList[0].team, "Team1","Expecting 'Team1' for the first team");
            assert.equal(parsedCSV.teamList[0].completed, 1,"1 member complete in 'Team1'");
            assert.equal(parsedCSV.teamList[0].percentComplete, 100,"Expecting 100% complete in 'Team1'");
            assert.equal(parsedCSV.teamList[1].percentComplete, 0,"Expecting 0% complete in 'Team2'");

            return promise;
        });
        
    });


    after(async()=>{
        //cleanup
        await db.getConn().queryPromise("DELETE FROM users WHERE id=?",[user.id]);
        await db.getConn().queryPromise("DELETE FROM badges WHERE userId=?",[user.id]);
        await db.getConn().queryPromise("DELETE FROM challengeEntries WHERE userId=?",[user.id]);
        let promise = new Promise((resolve,reject)=>{
            db.getConn().end();
            resolve(null);
        });
        
        return promise;
    });
});

