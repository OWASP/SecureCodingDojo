app.controller("codeBlocksCtrl", function($scope, $http, $routeParams, $location) {

    //whether the menu is active
    $scope.isCodeBlockActive = function (codeBlockId) { 
       
        return $routeParams.codeBlockId === codeBlockId;
    };
    
});