app.controller("dashboardCtrl", function($scope, $http) {
    
    $scope.init = function(){
        $http.get("/api/challengeStats",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                $scope.challengeStatList = response.data;
            }
        });

        $http.get("/api/moduleStats",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                $scope.moduleStatList = response.data;
            }
        });

        $http.get("/api/teamStats?limit=25",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                $scope.teamStatList = response.data;
            }
        });
    }

});