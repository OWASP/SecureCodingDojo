<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>

<%@ page import="inc.insecure.*" %>

<%
String feedbackVisibility="hidden";
String feedback="";
String successMessage = "";
String getYourCodeMarkup = String.format("<h3>You got it!</h3><a class='btn btn-success' href='%s'>Get your code</a>", Constants.SECRET_PAGE);


if(session==null || session.getAttribute("cwe79loggedin")==null || !(boolean)session.getAttribute("cwe79loggedin")){
	response.sendRedirect("cwe79.jsp?loggedin=false");
}
else{
	String displayName = request.getParameter("displayName");
		
	String avatar = request.getParameter("avatar");
	
	if(displayName!=null){
		displayName = displayName
		.replace("onload","on****")
		.replace("onclick","on****")
		.replace("onmouseover","on****")
		.replace("script","*****");
		
		session.setAttribute("cwe79displayName",displayName);
		if(Util.hasXSS(displayName)){ //challenge completed
			String code = "";
			try {
				code = CodeLoader.getInstance().getCode("cwe79");
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			session.setAttribute(Constants.CHALLENGE_CODE,code);
			successMessage = getYourCodeMarkup;
		}
		else if(Util.hasImgTagAndEvent(displayName)){
			feedbackVisibility="";
			if(displayName.indexOf("FIRE!")==-1 && displayName.indexOf("src")!=-1){
				feedback="You're almost there! Make sure your alert says <code>FIRE!</code>.";
			}
			else if(displayName.indexOf("src")==-1)
			{
				feedback="You're almost there! Are you missing a source tag?";
			}
			else{
				feedback="You're almost there! Your payload has everything it needs but maybe you need to check your syntax?";
			}
		}
		else if(Util.hasImgTag(displayName)){
			feedbackVisibility="";
			feedback="You got the right idea but you need to work on your attributes.";
		}
		else if(Util.hasScriptTagOrEvent(displayName)){
			feedbackVisibility="";
			feedback="Nice try! You have to get more imaginative with your payloads though ;)";
		}
			
	}
	displayName = (String)session.getAttribute("cwe79displayName");
	if(displayName==null) displayName="";
	
	if(avatar!=null) session.setAttribute("cwe79avatar",avatar);
	avatar = (String)session.getAttribute("cwe79avatar");
	if(avatar==null || avatar=="") avatar="public/avatar.png";
	
	

%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>cwe79 - Cross-Site Scripting - Guest</title>
<link rel="stylesheet" href="public/bootstrap/css/bootstrap.min.css">
<script src="public/jquery.min.js"></script>
<script src="public/bootstrap/js/bootstrap.min.js"></script>
<script>
function getProfile(){
	
	$.get("Cwe79Profile", function(data, status){
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
}
</script>
</head>
<body onload="getProfile()">
<nav class="navbar navbar-inverse">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="index.jsp">Insecure Inc.</a>
    </div>
    <ul class="nav navbar-nav">
      <li class="active"><a href="#">cwe79 - Cross-Site Scripting Guest</a></li>
      <!-- Hidden in the guest UI
	  <li class="active"><a href="cwe79admin.jsp">CWE863 - Cross-Site Scripting Admin</a></li>
	   -->
    </ul>
  </div>
</nav>
<div class="container"> 
<%=successMessage%>
<div class="alert alert-info <%=feedbackVisibility%>">
  <%=feedback%>
</div>

<h1>Welcome to the demo section of the site.  </h1>
<p>You can update how other users of the site view your profile, below.</p>

<form action="cwe79loggedin.jsp" autocomplete="off" method="POST">
<div class="form-group">
  <label for="displayName">Display Name:</label>
  <input type="text" class="form-control" id="displayName" name="displayName" value="<%=displayName.replace("\"","'")%>">
</div>

<div class="form-group">
  <label for="avatar">Avatar:</label>
  <input type="text" class="form-control" id="avatar" name="avatar" value="<%=avatar.replace("\"","'")%>">
</div>
<input type="submit" id="submit" class="btn" value="Update">
</form>


<br>
<br>
<h3>Preview your profile widget</h3>
<p>This is how other users of the site will see your profile.</p>
<hr>

<div class="media">
  <div class="media-left">
    <img src="public/avatar.png" class="media-object" style="width:60px" id="avatarImg">
  </div>
  <div class="media-body">
    <h4 class="media-heading" id="displayNameDiv">John Doe</h4>
    <p>Demo account...</p>
  </div>
</div>


</div>
</body>
</html>
<%
}
%>

