app.controller("trainingModulesCtrl", function ($scope, $http) {
    $scope.modules = null;
    $http.get("/static/lessons/modules.json")
    .then((response) => {
        $scope.modules = response.data;
    });

    $scope.badges = null;
    $http.get("/api/user/badges",window.getAjaxOpts())
    .then((response) => {
        $scope.badges = response.data;
    });

    $scope.isModuleEnabled = function(moduleId){
        if(!$scope.modules === null) return false;
        var trainingModule = $scope.modules[moduleId];
        for(reqModuleId of trainingModule.requiredModules){
            found = $scope.isModuleComplete(reqModuleId);
            if(!found){
                return false;
            }
        }
        return true;
    }
    $scope.isModuleComplete = function(moduleId){
        if($scope.badges === null) return false;
        for(badge of $scope.badges){
            if(moduleId === badge.moduleId){
                return true;
            }
        }
        return false;
    }
});