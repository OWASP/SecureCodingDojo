var db = require('../db');

//Test Suite 1 - user management
db.deleteUser("testDeleteMe");
db.insertUser({accountId:"testDeleteMe",familyName:"LastTest", givenName:"FirstTest"},function(){console.log("FAIL:insertUser");}, function(){
    console.log("SUCCESS:insertUser");
    db.getUser("testDeleteMe", function(){console.log("FAIL:getUser");}, function(user){
        console.log("SUCCESS:getUser")
        console.log(user);
        user.familyName = "UpdatedLastTest";
        user.givenName = "UpdatedFirstLastTest";
        db.updateUser(user,function(){console.log("FAIL:updateUser");},function(){
            console.log("SUCCESS:updateUser");
            db.getUser("testDeleteMe", function(){console.log("FAIL:getUser after update");}, function(user){
                console.log("SUCCESS:getUser after update")
                console.log(user);
                db.deleteUser(user.accountName,function(){console.log("FAIL:deleteUser")},function(){console.log("SUCCESS:deleteUser");console.log("SUCCESS: ===TEST SUITE 1===");});
            });
        });
    });
});

db.deleteUser("testDeleteMe1");
db.deleteUser("testDeleteMe2");

//Test Suite 2 - team management
db.insertUser({accountId:"testDeleteMe1",familyName:"LastTest1", givenName:"FirstTest1"},function(){console.log("FAIL:insertUser1 for team test");},function(){
    console.log("SUCCESS:insertUser1 for team test");
    db.insertUser({accountId:"testDeleteMe2",familyName:"LastTest2", givenName:"FirstTest2"},function(){console.log("FAIL:insertUser2 for team test");},function(){
        console.log("SUCCESS:insertUser2 for team test");
        db.getUser("testDeleteMe1", function(){console.log("FAIL:getUser");}, function(user){
            console.log("SUCCESS:getUser1");
            db.insertTeam(user,{name:"testTeamDeleteMe"}, function(){console.log("FAIL:insertTeam");}, function(){
                console.log("SUCCESS:insertTeam");
                db.getTeamWithMembersByName("testTeamDeleteMe",function(){console.log("FAIL:getTeamWithMembersByName");}, function(team){
                    console.log("SUCCESS:getTeamWithMembersByName");
                    console.log(team);
                    db.deleteTeam(user,team.id, function(){console.log("FAIL:deleteTeam");}, function(user){
                        console.log("SUCCESS:deleteTeam");
                        db.deleteUser("testDeleteMe1");
                        db.deleteUser("testDeleteMe2");
                        console.log("SUCCESS:===TEST SUITE 2===");
                    });
                });
            });
        });
    });
});
