app.controller("leaderboardCtrl", function($scope, $http) {
    
    $scope.teamListTimeRange = "-1";

    $scope.displayTeam = (team, range) => {
        let url = `/api/teams/${team.id}/badges`;
        if(range!=="-1") url+=`?days=${range}`;

        $http.get(url,window.getAjaxOpts())
        .then(function(response) {
            if(response !== null && response.data !== null){
                let teamMembers = response.data;
                let lbModules = $scope.lbModules;
                for(let moduleId in lbModules){
                    lbModules[moduleId].members = [];
                }
                
                for(let user of teamMembers){
                    if(user.moduleId===null){
                        continue;
                    }
                    for(let moduleId in lbModules){
                        if(moduleId===user.moduleId){
                            lbModules[moduleId].members.push(user);
                        }
                    }
                }
                //calculate percentage of completion
                for(let moduleId in lbModules){
                    let m = lbModules[moduleId];
                    if(team.playerCount > 0){
                        m.percentageCompleted = Math.round(m.members.length/team.playerCount*100);
                    }
                }

                $scope.lbModules = lbModules;
            }
        });
        
    }

    $scope.onTeamChange = function() {
        if($scope.teamStatList!==null){
            let selection = $scope.teamStatList[$scope.teamListChoice];
            let range = $scope.teamListTimeRange;
            if(typeof selection !== "undefined"){
                $scope.displayTeam(selection, range);
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
                for(let index = 0; index < $scope.teamStatList.length; index++){
                    let team = $scope.teamStatList[index];
                    if(team.id === $scope.user.teamId){
                        $scope.teamListChoice = index+"";
                        $scope.onTeamChange();
                        break;
                    }
                }
            }
        });

       
        
    }
});