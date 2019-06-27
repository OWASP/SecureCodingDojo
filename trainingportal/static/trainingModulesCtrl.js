app.controller("trainingModulesCtrl", function($scope, $http) {
    $scope.modules = {};
    $http.get("/static/lessons/modules.json")
    .then((response) => {
        $scope.modules = response.data;
    });
});