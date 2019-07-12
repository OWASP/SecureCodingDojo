
$get("/profile", function(data, status){
    if(data!=null){
        var dataArgs = data.split(",");
        if(dataArgs.length > 1){
            var displayName = dataArgs[0];
            var displayNameDiv = $("#displayNameDiv")[0];
            displayNameDiv.innerHTML = displayName;
            var avatarImg = $("#avatarImg")[0];
            avatarImg.src = dataArgs[1];
        }
    }
});
