<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>

<%@ page import="inc.insecure.*" %>
<%@ page import="javax.xml.*" %>
<%
String successMessage = "";
String validation = "";
String feedbackVisibility="hidden";
String feedback="";
String getYourCodeMarkup = String.format("<h3>You got it!</h3><a class='btn btn-success' href='%s'>Get your code</a>", Constants.SECRET_PAGE);


if(session==null || session.getAttribute("cwe434loggedin")==null || !(boolean)session.getAttribute("cwe434loggedin")){
	response.sendRedirect("cwe434.jsp?loggedin=false");
}
else{
	String displayName = (String)session.getAttribute("cwe434displayName");
	String avatar = (String)session.getAttribute("cwe434avatar");
	String avatarData = (String)session.getAttribute("cwe434avatarData");
	
	
	if(displayName==null) displayName = "";
	if(avatar==null || avatarData==null || avatar.equals("") || avatarData.equals("")) avatar = "public/avatar.png";
	else{
		avatar="Cwe434FileUpload?file="+avatar;
		//check the file type
		if(avatar.toLowerCase().endsWith(".war") || avatar.toLowerCase().endsWith(".jar") || avatar.toLowerCase().endsWith(".class") || avatar.toLowerCase().endsWith(".java")){
			feedbackVisibility = "";
			feedback = "Nice try but this file won't execute from the web content directory. You need to upload some 'server pages' ;)";
		}
		else if(avatar.toLowerCase().endsWith(".exe") || avatar.toLowerCase().endsWith(".sh") || avatar.toLowerCase().endsWith(".py")){
			feedbackVisibility = "";
			feedback = "I like how you're thinking but you will need to call this file from the command line somehow. You need to upload some 'server pages' ;)";
		}
		
	}
	



%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>cwe434 - Unrestricted Upload of File with Dangerous Type</title>
<link rel="stylesheet" href="public/bootstrap/css/bootstrap.min.css">
<script src="public/jquery.min.js"></script>
<script src="public/bootstrap/js/bootstrap.min.js"></script>
</head>
<body>
<nav class="navbar navbar-inverse">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="index.jsp">Insecure Inc.</a>
    </div>
    <ul class="nav navbar-nav">
      <li class="active"><a href="#">Unrestricted Upload of File with Dangerous Type</a></li>
     
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

<form action="Cwe434FileUpload" autocomplete="off" method="POST" enctype="multipart/form-data">
<div class="form-group">
  <label for="displayName">Display Name:</label>
  <input type="text" class="form-control" id="displayName" name="displayName" value="<%=displayName.replace("\"","'")%>">
</div>

<div class="form-group">
  <label for="avatar">Avatar (SVG file):</label>
  <input type="file" id="avatar" name="avatar">
</div>
<%=validation%>
<input type="submit" id="submit" class="btn" value="Update">
</form>

<br><br>
<h3>Preview your profile widget</h3>
<p>This is how other users of the site will see your profile.</p>
<hr>

<div class="media">
  <div class="media-left">
  	<img src="<%=avatar%>" class="media-object" style="width:60px" id="avatarImg">
  </div>
  <div class="media-body">
    <h4 class="media-heading" id="displayNameDiv"><%=displayName%></h4>
    <p>Demo account...</p>
  </div>
</div>


</div>
</body>
</html>
<%
}
%>

