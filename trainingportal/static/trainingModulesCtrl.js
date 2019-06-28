app.controller("trainingModulesCtrl", function ($scope, $http) {
    $scope.modules = {};
    $http.get("/static/lessons/modules.json")
    .then((response) => {
        $scope.modules = response.data;
    });

    $scope.badges = {};
    $http.get("/api/user/badges",window.getAjaxOpts())
    .then((response) => {
        $scope.badges = response.data;
    });

    $scope.isModuleEnabled = function(moduleId){
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
        for(badge of $scope.badges){
            if(moduleId === badge.moduleId){
                return true;
            }
        }
        return false;
    }
});