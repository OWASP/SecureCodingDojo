app.controller("reportCtrl",['$rootScope','$scope','$http', function($rootScope, $scope, $http) {
    
    
    $scope.uploadText="Choose a CSV file containing users to be included in the report. Users can be split by teams, one team per column.";
    $scope.moduleSelect = $rootScope.reportModule;
    $scope.reportDate = new Date().toLocaleDateString();
    $scope.upload = function(){
        let files = fileUpload.files;
        if(files && files.length > 0){
            let csv = files[0]; 
            $scope.uploadText = csv.name;
            let data = new FormData();
            data.append("reportCSV", csv);
            let httpOpts = window.getAjaxOpts();
            httpOpts.headers["Content-type"]=undefined;
            httpOpts.transformRequest = angular.identity;

            $http.post("/api/reportUpload",data,httpOpts)
            .then(function(response){
                if(response.data && response.data.status===200){
                    $scope.loadUserReport();
                }
            });

        }
    }

    

    $scope.loadUserReport = function(){
        $rootScope.reportModule = $scope.moduleSelect;
        $http.get(`/api/report/${$rootScope.reportModule}`,window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null
                    && response.status === 200 && 
                response.data.status===200){
                
                $scope.reportUsers = response.data;
            }
        },function(){
            
        });
    }

    $scope.loadUserReport();
    
}]);
