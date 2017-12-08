app.controller("activityCtrl", function($scope, $http) {
    $scope.fetchActivity = function(){
        $http.get("/api/activity?query="+nameFilter.value,window.getAjaxOpts())
            .then(function(response) {
                if(response != null && response.data != null){
                    $scope.activityList = response.data;
                }
            })
    }
    $scope.fetchActivity();
});