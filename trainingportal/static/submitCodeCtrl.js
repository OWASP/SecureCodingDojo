app.controller("submitCodeCtrl", function($scope, $http, $routeParams) {
    
   
    //reload the challenge page	
    $("#codeBlocksModal").on("hidden.bs.modal", function () {	
        if($scope.moduleComplete){
            $scope.moduleComplete = false;//reset
            window.location=`#!/`;
            let interval = 1000;
            setTimeout($scope.throwConfetti, 100);
            for(let i=1; i<3; i++) setTimeout($scope.throwConfetti, i * interval);
        }
        else{
            window.location=`#!/challenges/${$routeParams.moduleId}`;   
        }
    });	


    $scope.init = function(){
        $http.get("/api/salt",window.getAjaxOpts())
        .then(function(response) {
            if(response != null && response.data != null){
                $scope.salt = response.data;
            }
        });
    }


    $scope.hideError = function(){
        $scope.isCodeErrorMessage = false;
    }


    $scope.submitAnswer = function(){
        var moduleId = $routeParams.moduleId;
        var challengeId = $routeParams.challengeId;
        $scope.isCodeErrorMessage = false;
        $scope.isCodeSuccessMessage = false;
        $http.post("/api/user/challengeCode",{
            "moduleId":moduleId,
            "challengeId":challengeId,
            "challengeCode":challengeCode.value
        }, window.getAjaxOpts()).then(function(response) {
            if(response != null && response.data != null){
                if(response.data.status == 200){
                    $scope.isCodeSuccessMessage = true;
                    $scope.codeSuccessMessage = response.data.statusMessage;
                    
                    //refresh the ui data
                    $scope.loadData();

                    //get the code blocks for this challenge
                    var challenge = response.data.result;
                    var codeBlockIds = challenge.codeBlockIds;
                    var challengeCodeBlocks = [];
                    if(typeof codeBlockIds !== 'undefined' && codeBlockIds!=null){
                        for(var idx=0;idx<codeBlockIds.length;idx++){
                            var curId = codeBlockIds[idx];
                            challengeCodeBlocks.push($scope.codeBlocks[curId]);
                        }
                    }
                    $scope.challengeCodeBlocks = challengeCodeBlocks;
                    

                    $('#codeBlocksModal').modal('show');

                    if(challenge.moduleComplete){
                        $scope.moduleComplete = true;
                    }
                    
                }
                else{
                    $scope.isCodeErrorMessage = true;
                    $scope.codeErrorMessage = response.data.statusMessage;
                }
            }
        },function(errorResponse){
            $scope.isCodeErrorMessage = true;
            $scope.codeErrorMessage = "An HTTP error has occurred";
            
        });
        
    }
});