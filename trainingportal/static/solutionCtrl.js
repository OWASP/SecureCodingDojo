app.controller("solutionCtrl", function($scope, $http, $routeParams) {
    var challengeId = $routeParams.challengeId;
    $scope.solutionLink = "challenges/solutions/"+challengeId;
});