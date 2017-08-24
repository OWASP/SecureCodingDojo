<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>

<%@ page import="inc.insecure.*" %>

<%
String feedbackVisibility="hidden";
String feedback="";
if(session==null || session.getAttribute("cwe352loggedin")==null || !(boolean)session.getAttribute("cwe352loggedin")){
	response.sendRedirect("cwe352.jsp?loggedin=false");
}
else{
	String displayName = request.getParameter("displayName");
	String avatar = request.getParameter("avatar");
	
	if(displayName!=null){
		displayName = displayName.replace("<", "").replace(">", "");
		session.setAttribute("cwe352displayName",displayName);
	}
	displayName = (String)session.getAttribute("cwe352displayName");
	if(displayName==null) displayName="";
	
	if(avatar!=null){
		avatar = avatar.replace("<", "").replace(">", "");
		session.setAttribute("cwe352avatar",avatar);
		if(Util.hasCSRF(avatar)){ //challenge completed
			String code = "";
			try {
				code = CodeLoader.getInstance().getCode("cwe352");
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			session.setAttribute(Constants.CHALLENGE_CODE,code);
			response.sendRedirect(Constants.SECRET_PAGE);
		}
		else if(displayName.toLowerCase().indexOf("img") != -1){
			feedbackVisibility = "";
			feedback = "Ok this is not XSS. The developers are not allowing image tags in the name anymore. However there's an image created for you that you could leverage.";
		}else if(displayName.toLowerCase().indexOf("banjo") != -1){
			feedbackVisibility = "";
			feedback = "Perfect so your display name is Banjo. Check the url that you generated with the form. How can you cause other people to have the same display name when viewing your profile?";
		}
	}
	avatar = (String)session.getAttribute("cwe352avatar");
	if(avatar==null || avatar=="") avatar="public/avatar.png";
	
	

%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>cwe352 - Cross-Site Request Forgery - Guest</title>
<link rel="stylesheet" href="public/bootstrap/css/bootstrap.min.css">
<script src="public/jquery.min.js"></script>
<script src="public/bootstrap/js/bootstrap.min.js"></script>
<script>
function getProfile(){
	
	$.get("Cwe352Profile", function(data, status){
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
      <li class="active"><a href="#">cwe352 - Cross-Site Request Forgery Guest</a></li>
      <!-- Hidden in the guest UI
	  <li class="active"><a href="cwe352admin.jsp">CWE863 - Cross-Site Request Forgery Admin</a></li>
	   -->
    </ul>
  </div>
</nav>
<div class="container"> 
<h1>Welcome to the demo section of the site.  </h1>
<p>You can update how other users of the site view your profile, below.</p>
<form action="cwe352loggedin.jsp" autocomplete="off" method="GET">
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
<div class="alert alert-info <%=feedbackVisibility%>">
  		<%=feedback%>
</div>
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

