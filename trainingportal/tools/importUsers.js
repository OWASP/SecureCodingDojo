const path = require('path');
const fs = require('fs');
const db = require(path.join(__dirname, '../db'));
const util = require(path.join(__dirname, '../util'));
const challenges = require(path.join(__dirname, '../challenges'));

const USER_DUMP = "userDump.json";


async function importUsers(){

    var accountIdFormat = process.argv[2];
    var teamId = process.argv[3];
    
    
    if(!fs.existsSync(USER_DUMP)){       
        console.log(`Cannot find ${USER_DUMP}`);
    }
    else if(util.isNullOrUndefined(accountIdFormat)){
        console.log("User import functionality. Format: node importUsers.js <ACCOUNT_ID_FORMAT> [<TEAM_ID>]");
        console.log(`Please specify user id format ex:'SAML_%givenName%_%lastName%'`);
    }
    else{
        let users = require(path.join(__dirname,USER_DUMP));
        for(let user of users){
            user.accountId = accountIdFormat.replace("%givenName%",user.givenName).replace("%familyName%",user.familyName);

            //check if the user exists
            var dbUser = await db.getPromise(db.getUser, user.accountId);
           

            if(dbUser===null){ //create the user and update the team id
                //user doesn't exist level is 0
                await db.getPromise(db.insertUser,user);
                dbUser = await db.getPromise(db.getUser, user.accountId);
                if(!util.isNullOrUndefined(teamId)){
                    dbUser.teamId = teamId;
                }
            }
            else{ //only import challenges for users at a lower level

                for(let chId of user.passedChallenges){
                    await new Promise((resolve, reject) => {
                        challenges.insertChallengeEntry(dbUser,{"id":chId,"name":""},(err,result) =>{
                            if(err) reject(err);
                            else resolve(result);
                        })
                    });

                }
            }
        }
        console.log("Import complete.");
        process.exit(0);
    }
}

importUsers();