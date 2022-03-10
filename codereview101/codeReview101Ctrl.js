var app = angular.module("codeReview101", ['ngSanitize']);

app.controller("codeReview101Ctrl", function($scope, $http, $location) {
    
    $scope.fromPortal = window.location.search.indexOf("fromPortal")!==-1;

    $scope.getCode = function(id){
        var codeDiv = document.querySelector(`#codeDiv_${id}`);
        var codeText = document.querySelector(`#code_${id}`);

        var salt = document.querySelector(`#salt_${id}`);
        var hash = CryptoJS.SHA256(id+salt.value);
        var base64 = CryptoJS.enc.Base64.stringify(hash);
        codeText.value = base64; 
        codeDiv.style.display = ""         
    }

    $scope.copyCode = function(id){
        document.getElementById(`code_${id}`).select();
        document.execCommand('copy');
    }


    var onDefinitionsChanged = function(newDefinitions){
        //check whether category is complete
        for(let category of newDefinitions){
            if(!category.passed){
                var correct = true;
                for(let question of category.questions){
                    correct &= question.correct;
                }
                if(correct){
                    category.passed = true;
                }
            }
        }
        let allPassed = true;
        for(let category of newDefinitions){
            if(!category.passed){
                allPassed = false;
                break;
            }
        }
        if(allPassed){
            $('#finalModal').modal();
        }
    }

    $http.get("definitions.json")
    .then(function(response) {
        if(response != null && response.data != null){
            //init definitions
            $scope.definitions = response.data;
            
            $scope.$watch(function() { return $scope.definitions; }, onDefinitionsChanged, true);
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

app.directive("highlightCode", ['$http','$anchorScroll', function($http, $anchorScroll){

    function highlightLine(html,lineNoToHighlight){
        let lines = html.split("\n");
        let lineno = 1;
        html = "";
        for(let line of lines){
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
                let text = response.data;
                text = text.replace(/\/\*.+\*\//sg,"");
                text = replaceTags(text);
                
                if(scope.q && scope.q.lineToHighlight){
                    text = highlightLine(text,scope.q.lineToHighlight);
                }

                element.html(text);

                for(let domEl of element){
                    hljs.highlightBlock(domEl);
                }

                $anchorScroll();
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

app.filter('highlight', function() {
    return function(text, phrase) {
        return phrase
            ? text.replace(new RegExp('('+phrase+')', 'gi'), '<span class="uppercase-transform">$1</span>')
            : text;
    };
});
