const passChallenges = require('./challengeUtil').passChallenges;
const db = require("../db");


var setupDemoUsers = async () => {
    try {
        
        await db.getPromise(db.insertUser,{accountId:"user1",familyName:"Johnson", givenName:"Mike"});
        await db.getPromise(db.insertUser,{accountId:"user2",familyName:"Hunt", givenName:"Carla"});
        await db.getPromise(db.insertUser,{accountId:"user3",familyName:"Wu", givenName:"Joe"});
        await db.getPromise(db.insertUser,{accountId:"user4",familyName:"Singh", givenName:"Deepak"});
        await db.getPromise(db.insertUser,{accountId:"user5",familyName:"Fernandez", givenName:"Maria"});
        await db.getPromise(db.insertUser,{accountId:"user6",familyName:"Jones", givenName:"Amalia"});
     

        let user1 = await db.getPromise(db.getUser,"user1");

        await db.getPromise(db.insertTeam,[user1,{name:"Demo"}]);
        let team = await db.getPromise(db.getTeamWithMembersByName,"Demo");
        await db.getConn().queryPromise("UPDATE users SET teamId = ? WHERE accountId LIKE 'user%'",[team.id]);

        let user2 = await db.getPromise(db.getUser,"user2");
        let user3 = await db.getPromise(db.getUser,"user3");
        let user4 = await db.getPromise(db.getUser,"user4");
        let user5 = await db.getPromise(db.getUser,"user5");    
        let user6 = await db.getPromise(db.getUser,"user6");

        await passChallenges("blackBelt",user1);
        await passChallenges("secondDegreeBlackBelt",user1);

        await passChallenges("blackBelt",user2);

        await passChallenges("securityCodeReviewMaster",user2);
        
        await passChallenges("blackBelt",user3);
        await passChallenges("securityCodeReviewMaster",user3);

        await passChallenges("securityCodeReviewMaster",user4);
        await passChallenges("blackBelt",user4);

        await passChallenges("securityCodeReviewMaster",user5);

        await passChallenges("blackBelt",user6);
        await passChallenges("securityCodeReviewMaster",user6);
        await passChallenges("secondDegreeBlackBelt",user6);
    }
    catch (error) {
        console.log(error);
    }
   
};

setupDemoUsers();