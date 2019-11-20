const path = require('path');
const fs = require('fs');
const db = require(path.join(__dirname, '../db'));
const USER_DUMP = "userDump.json";

var conn = db.getConn();
async function exportUsers(){
    var result = [];

    let users = await conn.queryPromise("SELECT id,givenName,familyName,level,teamId FROM users");
        
    for(let user of users){
        let entries = await conn.queryPromise("SELECT challengeId FROM challengeEntries WHERE userId=?",[user.id]);
    
        var passedChallenges = [];
        if(entries!=null){
            entries.forEach(function(challenge){
                passedChallenges.push(challenge.challengeId);
            });
        }
        
        user.passedChallenges = passedChallenges;
        result.push(user);
    }

    fs.writeFileSync(USER_DUMP, JSON.stringify(result), 'utf8');
    console.log(`Users dumped to ${USER_DUMP}`);
    process.exit(0);
}

exportUsers();

