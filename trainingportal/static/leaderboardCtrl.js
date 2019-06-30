app.controller("leaderboardCtrl", function($scope, $http) {
 

    $scope.onTeamChange = function() {
        if($scope.teamStatList!==null){
            let selection = $scope.teamStatList[$scope.teamListChoice];
            if(typeof selection !== "undefined"){
                $scope.teamListChoice = `${selection.teamName} (${selection.playerCount})`;
                $http.get("/api/teams/"+selection.id+"/badges",window.getAjaxOpts())
                .then(function(response) {
                    if(response !== null && response.data !== null){
                        let teamMembers = response.data;
                        let modules = $scope.modules;
                        for(moduleId in modules){
                            modules[moduleId].members = [];
                        }
                        for(user of teamMembers){
                            if(user.moduleId===null){
                                user.moduleId = "none";
                            }
                            for(moduleId in modules){
                                if(moduleId===user.moduleId){
                                    modules[moduleId].members.push(user);
                                }
                            }
                        }
                        //calculate percentage of completion
                        for(moduleId in modules){
                            let m = modules[moduleId];
                            if(selection.playerCount > 0){
                                m.percentageCompleted = Math.round(m.members.length/selection.playerCount*100);
                            }
                        }
                    }
                });
            }
        }
    }

    $scope.init = function(){
        $scope.teamStatList = null;
        $http.get("/api/teamStats",window.getAjaxOpts())
        .then(function(response) {
            if(response !== null && response.data !== null){
                $scope.teamStatList = response.data;
            }
        });
        $scope.modules = null;
        $http.get("/static/lessons/modules.json")
        .then((response) => {
            let modules = response.data;
            //add an extra module for NONE
            modules["none"]={"name":"None"};

            $scope.modules = modules;
        });
        
    }
});