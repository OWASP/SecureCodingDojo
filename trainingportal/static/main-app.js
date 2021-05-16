var app = angular.module('challengesApp', ['ngRoute','dataSvcModule']);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "static/trainingModules.html",
        controller: "trainingModulesCtrl"
    })
    .when("/challenges/:moduleId?", {
        templateUrl : "static/challenges.html",
        controller: "challengesCtrl"
    })
    .when("/submitCode/:moduleId/:challengeId", {
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
    }).when("/dashboard", {
        templateUrl : "static/dashboard.html",
        controller: "dashboardCtrl"
    }).when("/report", {
        templateUrl : "static/report.html",
        controller: "reportCtrl"
    }).when("/solution/:challengeId", {
        templateUrl : "static/solution.html",
        controller: "solutionCtrl"
    });
});

app.directive('highlightCode', [ function(){

    function doHighlight(preList){
        for(let pre of preList){
            hljs.highlightBlock(pre);
        }
    }

    function linkFunc (scope, element, attrs) {
        for(let domEl of element){
            var preList = domEl.querySelectorAll('pre');
            setTimeout(doHighlight,1,preList)   
        }        
    }

    return {
        link: linkFunc
    } 
}])

app.controller('mainCtrl', ['$rootScope','$http','$location','dataSvc', function($scope, $http, $location, dataSvc) {
    

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
                    //create a map of team names to team ids
                    for(let team of teamList){
                        $scope.teamNames[team.id] = team.name;
                    }
                    $http.get("/api/users",window.getAjaxOpts())
                    .then(function(response) {
                        if(response != null && response.data != null){

                            for(let team of teamList){
                                if(team.ownerId!=null && team.ownerId === $scope.user.id){// the user cannot change their team until they delete their current team
                                    $scope.ownedTeam = team;
                                }
                                if(team.id===$scope.user.teamId){
                                    userTeamListChoice.value = team.name;
                                    $scope.existingTeamSelect = team.id;
                                }
                            }
                            $scope.teamList = teamList;

                        }
                    });
                }
            });
    }

    $scope.onUserTeamChange = function(){
        if($scope.teamList!==null && typeof userTeamListChoice !== "undefined" && userTeamListChoice.value!==""){
            let index = parseInt(userTeamListChoice.value,10);
            if(typeof index !== "undefined" && !isNaN(index)){
                let selectedTeam = $scope.teamList[index];
                $scope.existingTeamSelect = selectedTeam.id;
                userTeamListChoice.value = selectedTeam.name;
            }
        }
    }

    $scope.existingTeamSelect = null;
    //validate the team settings and save
    $scope.saveTeamSettings = function() {
        $scope.hideMessages();
        if(newTeamName.value == ""){
            if($scope.existingTeamSelect===null){
                //no team was selected show a message
                $scope.isTeamSaveError = true;
                $scope.teamSaveErrorMessage = "No team was selected";
            }
            else{
                var teamId = $scope.existingTeamSelect;
                //update the team
                $http.post("/api/user/team",{
                    "teamId": teamId
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
        var profileInfo = {};
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

                $scope.fetchTeams();
                        
                //do the first activity heartbeat
                $scope.activityHeartBeat();
                
            
                //get the code blocks definitions
                $http.get("static/codeBlocks/codeBlocksDefinitions.json").then(function(response) {
                    if(response != null && response.data != null){
                        $scope.codeBlocks = response.data;

                    }
                });
            }
        });
    }

    $scope.loadData();


    

    $scope.throwConfetti = function() {
        var duration = 15 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        var timeLeft = animationEnd - Date.now();
        
        var particleCount = 50 * (timeLeft / duration);

        var randomInRange = (min,max) => { Math.random() * (max - min) + min }
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }


}]);