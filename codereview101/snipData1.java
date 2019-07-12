
String usr = request.getParameter("usr");
String usr = request.getParameter("pwd");
User user = UserColl.find(usr);

if(user.getPassword().equals(pwd)){
    
    //password verified
