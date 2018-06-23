var app = angular.module('challengesApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "static/challenges.html"
    })
    .when("/submitCode/:challengeId", {
        templateUrl : "static/submitCode.html",
        controller: "submitCodeCtrl"
    })
    .when("/codeBlocks/:codeBlockId", {
        templateUrl : "static/codeBlocks.html",
        controller: "codeBlocksCtrl"
    })
    .when("/leaderboard", {
        templateUrl : "static/leaderboard.html",
        controller: "leaderboardCtrl"
    }).when("/activity", {
        templateUrl : "static/activity.html",
        controller: "activityCtrl"
    }).when("/report", {
        templateUrl : "static/report.html",
        controller: "reportCtrl"
    }).when("/solution/:challengeId", {
        templateUrl : "static/solution.html",
        controller: "solutionCtrl"
    });
});


app.controller('mainCtrl', function($scope, $http, $location) {
    

    //redirect the user to the previous page if they got logged out
    var redirectPath = window.sessionStorage.getItem("redirectPath");
    if(redirectPath!=null && redirectPath!=="" && redirectPath.indexOf("/")===0){
        //clear the session storage
        window.sessionStorage.removeItem("redirectPath");
        $location.url(redirectPath);
    }
    
    $scope.activityHeartBeat = function(){
        $http.get("/api/activity/heartbeat",window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null && response.status === 200){
                    if(response.data.length > 0){
                        var activity = response.data[0];
                        var message = activity.givenName + " " + activity.familyName + " has solved '" +
                        activity.challengeName + "'";
                        $scope.showActivityMessage = $scope.latestActivityMessage !== message;
                        if($scope.showActivityMessage && $scope.fetchActivity){
                            $scope.fetchActivity();
                        }
                        $scope.latestActivityMessage = message;  
                    }            
                    else if(response.data.status===401){
                        window.location = "/"; 
                    }
                }
                else{
                    window.location = "/";    
                }
            },function(){
                window.location = "/";
            });
    }

    $scope.fetchActivity = function(){
        var filter = "";
        if(typeof nameFilter !== 'undefined'){
            filter=nameFilter.value;
        }
        $http.get("/api/activity?query="+filter,window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null){
                    $scope.activityList = response.data;
                }
            })
    }

    setInterval($scope.activityHeartBeat,10*1000);
    
    $scope.loadUserReport = function(){
        $http.get("/api/report",window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null
                     && response.status === 200 && 
                    response.data.status===200){
                    
                    $scope.reportUsers = response.data;
                    $scope.reportAvailable = true;
                            
                }
            },function(){
               
            });
    }

    //whether the menu is active
    $scope.isActive = function (viewLocation) { 
        if(viewLocation==="/") return $location.path()===viewLocation;
        return $location.path().indexOf(viewLocation)==0;
    };

    $scope.hasCodeBlocks = function(challenge){
        return typeof challenge.codeBlockIds !== 'undefined' && challenge.codeBlockIds!=null && challenge.codeBlockIds.length>0
    }

    //hide a team save error
    $scope.hideTeamSaveError = function() {
        $scope.isTeamSaveError = false;
    }

    //hide a team save success message
    $scope.hideTeamSaveSuccess = function() {
        $scope.isTeamSaveSuccess = false;
    }

    //hide a team save success message
    $scope.hideMessages = function() {
        $scope.hideTeamSaveError();
        $scope.hideTeamSaveSuccess(); 
    }

    //delete current owned team
    $scope.deleteOwnedTeam = function() {
        if(confirm("Are you sure?")){
            $http.delete("/api/user/team",window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null){
                    if(response.data.status == 200){
                        //team id saved
                        $scope.user.teamId = null;
                        $scope.ownedTeam = null;
                        $scope.isTeamSaveSuccess = true;
                        $scope.teamSaveSuccessMessage = response.data.statusMessage;
                        //refresh the list of teams
                        $scope.fetchTeams();
                    }
                    else{
                        $scope.isTeamSaveError = true;
                        $scope.teamSaveErrorMessage = response.data.statusMessage;
                    }

                }
            },function(errorResponse){
                    $scope.isTeamSaveError = true;
                    $scope.teamSaveErrorMessage = "A http error has occured.";
                    
            });
        }
    }

    $scope.fetchTeams = function(){
        $http.get("/api/teams",window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null){
                    $scope.teamNames = {};
                    var teamList = response.data;
                    var teamListCount = teamList.length;
                    //create a map of team names to team ids
                    for(var tIdx=0;tIdx<teamListCount; tIdx++){
                        var team = teamList[tIdx];
                        $scope.teamNames[team.id] = team.name;
                    }
                    $http.get("/api/users",window.getAjaxOpts())
                    .then(function(response) {
                        if(response != null && response.data != null){
                            var userList = response.data;

                            for(var teamIdx=0;teamIdx<teamListCount;teamIdx++){
                                var team = teamList[teamIdx];
                                if(team.ownerId!=null && team.ownerId === $scope.user.id){// the user cannot change their team until they delete their current team
                                    $scope.ownedTeam = team;
                                }
                                var levelCount = $scope.challengeDefinitions.length;
                                var challengeDefinitions = [];
                                for(var levelIdx=0;levelIdx<levelCount;levelIdx++){
                                    var level = {};
                                    var levelMembers = [];
                                    var userListCount = userList.length;
                                    for(var userIdx=0;userIdx<userListCount;userIdx++){
                                        var user = userList[userIdx];
                                        if(user.level==null) user.level = 0;
                                        if(user.level==levelIdx && user.teamId == team.id){
                                            levelMembers.push(user);
                                        }
                                    } 
                                    level.members = levelMembers;   
                                    challengeDefinitions.push(level);
                                }
                                team.challengeDefinitions = challengeDefinitions;
                            }
                            $scope.teamList = teamList;

                        }
                    });
                }
            });
    }


    //validate the team settings and save
    $scope.saveTeamSettings = function() {
        $scope.hideMessages();
        if(newTeamName.value == ""){
            if(existingTeamSelect.value==0){
                //no team was selected show a message
                $scope.isTeamSaveError = true;
                $scope.teamSaveErrorMessage = "No team was selected";
            }
            else{
                //update the team
                var teamId = existingTeamSelect.value;
                $http.post("/api/user/team",{
                    teamId:teamId
                }, window.getAjaxOpts())
                .then(function(response) {
                    if(response != null && response.data != null){
                        if(response.data.status == 200){
                            //team id saved
                            $scope.user.teamId = teamId;
                            $scope.isTeamSaveSuccess = true;
                            $scope.teamSaveSuccessMessage = response.data.statusMessage;
                            //refresh the list of teams (for the leaderboard)
                            $scope.fetchTeams();
                        }
                        else{
                            $scope.isTeamSaveError = true;
                            $scope.teamSaveErrorMessage = response.data.statusMessage;
                        }

                    }
                },function(errorResponse){
                    $scope.isTeamSaveError = true;
                    $scope.teamSaveErrorMessage = "A http error has occured.";
                    
                });
            }

        }
        else{
            //the user is creating a new team and they will become the team leader
            var teamName = newTeamName.value;
            $http.post("/api/teams",{
                    name:teamName
                }, window.getAjaxOpts())
                .then(function(response) {
                    if(response != null && response.data != null){
                        if(response.data.status == 200){
                            //team saved
                            team = response.data.result;
                            $scope.user.teamId = response.data.result.id;
                            $scope.isTeamSaveSuccess = true;
                            $scope.teamSaveSuccessMessage = response.data.statusMessage;
                            //refresh the list of teams (for the leaderboard)
                            $scope.fetchTeams();
                        }
                        else{
                            $scope.isTeamSaveError = true;
                            $scope.teamSaveErrorMessage = response.data.statusMessage;
                        }

                    }
                },function(errorResponse){
                    $scope.isTeamSaveError = true;
                    $scope.teamSaveErrorMessage = "An http error has occured.";
                    
                });
        }

    }

    $scope.updateLocalUser = function(){
        $scope.isProfileSaveError = false;
        $scope.isProfileSaveSuccess = false;
        $scope.profileSaveErrorMessage = "";
        profileInfo = {};
        profileInfo.curPassword = currentPassword.value.trim();
        profileInfo.newPassword = newPassword.value.trim();
        
        if(vfyPassword.value.trim()!==profileInfo.newPassword){
            $scope.isProfileSaveError = true;
            $scope.profileSaveErrorMessage = "New password and verification password do not match";
            return;
        }

        $http.post("/api/localUser/updateUser",{"profileInfo":profileInfo},window.getAjaxOpts())
        .then(function(response) {
            if(response !== null && response.data !== null){
                if(response.data.status == 200){
                    $scope.isProfileSaveSuccess = true;
                    $scope.profileSaveSuccessMessage = "User updated.";
                }
                else{
                    $scope.isProfileSaveError = true;
                    $scope.profileSaveErrorMessage = response.data.statusMessage;
                }

            }
        },function(errorResponse){
            $scope.isProfileSaveError = true;
            $scope.profileSaveErrorMessage = "A http error has occurred.";
            
        });
    }


    $scope.loadData = function(){
        $http.get("/api/user",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                var user = response.data;
                
                $scope.user = user;
                $scope.fullName = user.givenName + ' ' + user.familyName;
                $scope.firstName = user.givenName;
                
                $http.get("/challengeDefinitions.json")
                .then(function(response) {
                    if(response != null && response.data != null){
                        $scope.levelNames = {};
                        var challengeDefinitions = response.data;
                        if(challengeDefinitions.length >= 1){
                            if($scope.user.level == null){
                                $scope.user.level = 0;
                            }

                            $scope.userLevelString = challengeDefinitions[$scope.user.level].name;                

                            //update the challenge definitions to include the current user's passed challenges
                            for(var lIdx=0;lIdx<challengeDefinitions.length;lIdx++){
                                var level = challengeDefinitions[lIdx];
                                $scope.levelNames[lIdx] = level.name;

                                var challenges = level.challenges;
                                
                                if(challenges!=null){
                                    for(var cIdx=0;cIdx<challenges.length;cIdx++){
                                        var ch = challenges[cIdx];
                                        var passed = $scope.user.passedChallenges;
                                        if(passed!=null){
                                            for(var uIdx=0; uIdx < passed.length; uIdx++){
                                                passed[uIdx].passed=false;
                                                if(ch.id===passed[uIdx].challengeId){
                                                    ch.passed = true;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        $scope.challengeDefinitions = challengeDefinitions;

                        $scope.fetchTeams();
                        
                        //do the first activity heartbeat
                        $scope.activityHeartBeat();
                    }
                });
                //get the code blocks definitions
                $http.get("static/codeBlocks/codeBlocksDefinitions.json").then(function(response) {
                    if(response != null && response.data != null){
                        $scope.codeBlocks = response.data;
                        
                    }
                });

                //get the code blocks definitions
                $http.get("api/target",window.getAjaxOpts()).then(function(response) {
                    if(response != null && response.data != null){
                        $scope.targetUrl = response.data;
                        
                    }
                });

                //load the user report
                $scope.loadUserReport();
            }
        });
    }
    
    $scope.loadData();
});