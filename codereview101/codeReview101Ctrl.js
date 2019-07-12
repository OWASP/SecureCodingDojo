var app = angular.module("codeReview101", ['ngSanitize']);

app.controller("codeReview101Ctrl", function($scope, $http) {
    
    $http.get("definitions.json")
    .then(function(response) {
        if(response != null && response.data != null){
            //init definitions
            $scope.definitions = response.data;
        }
    },function(errorMessage){
        console.error(errorMessage);
        $scope.errorMessage = `An HTTP error has occured: '${errorMessage.statusText}'!`;            
    });


});

app.directive("markdownIt", ['$sanitize', function($sanitize){
    function linkFunc(scope, element, attrs) {
        var md = window.markdownit();
        element.html($sanitize(md.render(element.text())));
    }

    return {
        restrict: "AE",
        link: linkFunc
    } 
}])

app.directive("highlightCode", ['$http', function($http){

    function highlightLine(html,lineNoToHighlight){
        let lines = html.split("\n");
        lineno = 1;
        html = "";
        for(line of lines){
            if(lineno == lineNoToHighlight ){
                html+=`<span class="text-white">${line}</span>`;
            }
            else{
                html+=line;
            }
            html+="\n";
            lineno++;
        }
        return html;
    }

    function replaceTags(text){
        text=text.replace(/&/g,"&amp;");
        text=text.replace(/</g,"&lt;");
        text=text.replace(/>/g,"&gt;");
        return text;       
    }

    function linkFunc (scope, element, attrs) {

        $http.get(attrs.snippet)
        .then(function(response) {
            if(response != null && response.data != null){
                //init definitions
                text = response.data;
                text = replaceTags(text);
                
                if(scope.q && scope.q.lineToHighlight){
                    text = highlightLine(text,scope.q.lineToHighlight);
                }

                element.html(text);

                for(domEl of element){
                    hljs.highlightBlock(element[0]);
                }
            }
        });
       

        //listeners follow

        element.on("click",function(event){
            let q = scope.q;
            if(typeof q.correct !== "undefined") return;
            q.correct = (q.answer === scope.$index);
            element.selected = true;
            if(q.correct){
                element.css({
                    backgroundColor:"darkgreen"
                });
            }
            else {
                element.css({
                    backgroundColor:"darkred"
                });
            }

            scope.$apply();
        });

        element.on("mouseover",function(event){
            let q = scope.q;
            if(typeof q.correct !== "undefined") return;
            element.css({
                backgroundColor:"darkslategray"
            });
            
        });

        element.on("mouseleave",function(event){
            let q = scope.q;
            if(typeof q.correct !== "undefined") return;
            element.css({
                backgroundColor:""
            });
        });
    }

    return {
        restrict: "AE",
        link: linkFunc
    } 
}])