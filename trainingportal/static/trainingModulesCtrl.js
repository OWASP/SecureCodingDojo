app.controller("trainingModulesCtrl", function ($scope, $http) {
    $scope.badges = null;


    $scope.init=()=>{
        $http.get("/api/user/badges",window.getAjaxOpts())
        .then((response) => {
            $scope.badges = response.data;
        });
    }

    $scope.isModuleEnabled = (moduleId)=>{
        if($scope.modules === null) return false;
        var trainingModule = $scope.modules[moduleId];
        for(let reqModuleId of trainingModule.requiredModules){
            let found = $scope.isModuleComplete(reqModuleId);
            if(!found){
                return false;
            }
        }
        return true;
    }
    $scope.isModuleComplete = (moduleId)=>{
        if($scope.badges === null) return false;
        for(let badge of $scope.badges){
            if(moduleId === badge.moduleId){
                return true;
            }
        }
        return false;
    }

    $scope.getBadgeCode = (moduleId) =>{
        if($scope.badges === null) return null;
        for(let badge of $scope.badges){
            if(moduleId === badge.moduleId){
                return badge.code;
            }
        }
        return null;
    }
});