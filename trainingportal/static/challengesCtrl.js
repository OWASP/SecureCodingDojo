app.controller("challengesCtrl", function($scope, $http, $routeParams) {

    $scope.percentDone = 0;
    $scope.completionLabel = "0/0";
    $scope.getDescriptionLink = (chId) => {
        if(chId){
            return `/challenges/descriptions/${chId}`;
        }
    }

    $scope.isLoading = () => {
        return typeof $scope.challengesAvailable === 'undefined';
    }

    $scope.init = () => {
        $scope.moduleId = $routeParams.moduleId;
        $http.get(`/challenges/${$scope.moduleId}/level`)
        .then((response) => {
            if(response != null && response.data != null){
                $scope.userLevel = response.data.level;
                $scope.loadChallenges();
            }
        });

    }

    $scope.submitOption = function(id, digest){
        let answer = null;
        let options = document.getElementsByClassName(`option-${id}`);
        for(let op of options){
            if(op.checked){
                answer = op.value
                break;
            }
        }
        $scope.saveAnswer(answer,id,digest);   
    }

    $scope.submitAnswer = function(id, digest){
        let answer = null;
        let el = document.getElementById(`answer-${id}`);
        if(el){
            answer = el.value;
        }
        $scope.saveAnswer(answer,id,digest);
    }

    $scope.saveAnswer = function(answer, id, digest){
        if(answer !== null){
            localStorage.setItem("dojo.current.answer", answer);
            localStorage.setItem("dojo.current.challenge", window.location.href);
            window.location.href = `#!submitCode/${$scope.moduleId}/${id}/quiz/${digest}`;
        }
    }


    $scope.loadChallenges = function(){
        $http.get(`/challenges/${$scope.moduleId}`)
        .then(function(response) {
            if(response != null && response.data != null && Array.isArray(response.data.challenges)){
                $scope.levelNames = {};
                var challengeDefinitions = response.data.challenges;
                let totalChCount = 0;
                let passedChCount = 0;
                if(challengeDefinitions.length >= 1){
                    //update the challenge definitions to include the current user's passed challenges
                    for(let levelId in challengeDefinitions){
                        var level = challengeDefinitions[levelId];
                        $scope.levelNames[levelId] = level.name;

                        var challenges = level.challenges;
                        if(challenges.length>0){
                            $scope.challengesAvailable = true;
                        }
                        if(challenges!=null){
                            for(let ch of challenges){
                                var passedChallenges = $scope.user.passedChallenges;
                                totalChCount++;
                                if(passedChallenges!=null){
                                    for(let passedCh of passedChallenges){
                                        if(ch.id===passedCh.challengeId){
                                            ch.passed = true;
                                            passedChCount++;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                $scope.targetUrl = response.data.targetUrl;
                $scope.moduleChallengeDefinitions = challengeDefinitions;

                $scope.percentDone = passedChCount/totalChCount * 100;
                $scope.completionLabel = `${passedChCount}/${totalChCount}`;
            }
            else{
                $scope.challengesAvailable = false;
            }
        });
    }
});