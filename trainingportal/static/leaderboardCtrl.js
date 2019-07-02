app.controller("leaderboardCtrl", function($scope, $http) {
 

    $scope.displayTeam = (team) => {
        
        $http.get(`/api/teams/${team.id}/badges`,window.getAjaxOpts())
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
                    if(team.playerCount > 0){
                        m.percentageCompleted = Math.round(m.members.length/team.playerCount*100);
                    }
                }
            }
        });
        
    }

    $scope.onTeamChange = function() {
        if($scope.teamStatList!==null){
            let selection = $scope.teamStatList[$scope.teamListChoice];
            if(typeof selection !== "undefined"){
                $scope.teamListChoice = `${selection.teamName} (${selection.playerCount})`;
                $scope.displayTeam(selection);
            }
        }
    }

    $scope.init = function(){
        $scope.teamStatList = null;
        $http.get("/api/teamStats",window.getAjaxOpts())
        .then(function(response) {
            if(response !== null && response.data !== null){
                $scope.teamStatList = response.data;
                //preselect current user's team
                for(index = 0; index < $scope.teamStatList.length; index++){
                    let team = $scope.teamStatList[index];
                    if(team.id === $scope.user.teamId){
                        $scope.teamListChoice = index;
                        $scope.onTeamChange();
                        break;
                    }
                }
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