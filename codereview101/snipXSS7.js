
$get("/profile", function(data, status){
    if(data!=null){
        var dataArgs = data.split(",");
        if(dataArgs.length > 1){
            var displayName = dataArgs[0];
            setTimeout(`showProfile('${displayName}')`, 1000);
        }
    }
});
