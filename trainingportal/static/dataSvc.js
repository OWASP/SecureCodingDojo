var dataSvc = angular.module('dataSvcModule', []);
/**
 * Provides common data loading services
 */
dataSvc.factory('dataSvc', ['$rootScope','$http',
    function($rootScope, $http) {
        //get the modules
        $rootScope.modules = null;
        $http.get("/api/modules", window.getAjaxOpts()).then((response) => {
            $rootScope.modules = response.data;
            //create modules for leaderboard
            $rootScope.lbModules = {};
            Object.assign($rootScope.lbModules, $rootScope.modules);
            $rootScope.lbModules["none"] = {"name":"N/A"};
            $rootScope.reportModule = Object.keys($rootScope.modules)[0];
        });

        return {
            
        }
    }
]);