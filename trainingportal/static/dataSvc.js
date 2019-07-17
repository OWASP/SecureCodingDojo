var dataSvc = angular.module('dataSvcModule', []);
/**
 * Provides common data loading services
 */
dataSvc.factory('dataSvc', ['$rootScope','$http',
    function($rootScope, $http) {
        //get the modules
        $rootScope.modules = null;
        $http.get("/static/lessons/modules.json").then((response) => {
            $rootScope.modules = response.data;
            //create modules for leaderboard
            $rootScope.lbModules = {};
            Object.assign($rootScope.lbModules, $rootScope.modules);
            $rootScope.lbModules["none"] = {"name":"None"};
            $rootScope.reportModule = Object.keys($rootScope.modules)[0];
        });

        return {
            
        }
    }
]);