app.controller("challengesCtrl", function($scope, $http, $routeParams) {

    $scope.getDescriptionLink = (chId) => {
        if(chId){
            return `/challenges/descriptions/${chId}`;
        }
    }

    $scope.init = () => {
        $scope.moduleId = $routeParams.moduleId;
        $scope.challengesAvailable = false;
        $http.get(`/challenges/${$scope.moduleId}/level`)
        .then((response) => {
            if(response != null && response.data != null){
                $scope.userLevel = response.data.level;
            }
        });

        $http.get(`/challenges/${$scope.moduleId}`)
        .then(function(response) {
            if(response != null && response.data != null){
                $scope.levelNames = {};
                var challengeDefinitions = response.data;
                if(challengeDefinitions.length >= 1){
                    //update the challenge definitions to include the current user's passed challenges
                    for(levelId in challengeDefinitions){
                        var level = challengeDefinitions[levelId];
                        $scope.levelNames[levelId] = level.name;

                        var challenges = level.challenges;
                        if(challenges.length>0){
                            $scope.challengesAvailable = true;
                        }
                        if(challenges!=null){
                            for(ch of challenges){
                                var passedChallenges = $scope.user.passedChallenges;
                                if(passedChallenges!=null){
                                    for(passedCh of passedChallenges){
                                        if(ch.id===passedCh.challengeId){
                                            ch.passed = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                $scope.moduleChallengeDefinitions = challengeDefinitions;


            }
        });
    }
});