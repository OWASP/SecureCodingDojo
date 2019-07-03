app.controller("activityCtrl", function($scope, $http) {
    
    $scope.fetchActivity();

    $scope.toLocaleDate = (ts) => {
        return new Date(ts).toLocaleString();
    }
});