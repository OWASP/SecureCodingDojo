app.controller("dashboardCtrl", function($scope, $http) {
    
    $scope.init = function(){
        $http.get("/api/challengeStats",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                $scope.challengeStatList = response.data;
            }
        });

        $http.get("/api/levelStats",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                $scope.levelStatList = response.data;
            }
        });

        $http.get("/api/teamStats",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                $scope.teamStatList = response.data;
            }
        });
    }

});