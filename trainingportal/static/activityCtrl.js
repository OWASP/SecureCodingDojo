app.controller("activityCtrl", function($scope, $http) {
    $scope.fetchActivity = function(){
        $http.get("/api/activity",window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null){
                    $scope.activityList = response.data;
                }
            })
    }
    $scope.fetchActivity();
});