
String usr = request.getParameter("usr");
String usr = request.getParameter("pwd");
User user = UserColl.find(usr);
String givenValue = Utils.PBKDF2(pwd, user.getSalt(), user.getIterations());
if(user.getPassHash().equals(givenValue)){
    
    //password verified
