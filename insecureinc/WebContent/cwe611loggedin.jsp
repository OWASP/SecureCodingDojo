<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>

<%@ page import="inc.insecure.*" %>
<%@ page import="javax.xml.*" %>
<%
String successMessage = "";
String validation = "";
String getYourCodeMarkup = String.format("<h3>You got it! <small>(view page source to see the contents)</small></h3><a class='btn btn-success' href='%s'>Get your code</a>", Constants.SECRET_PAGE);


if(session==null || session.getAttribute("cwe611loggedin")==null || !(boolean)session.getAttribute("cwe611loggedin")){
	response.sendRedirect("cwe611.jsp?loggedin=false");
}
else{
	String displayName = (String)session.getAttribute("cwe611displayName");
	String avatar = (String)session.getAttribute("cwe611avatar");
	String original = avatar;
	
	if(Util.isExternalProtocol(avatar)) {
		avatar = null;
		validation="<div class='alert alert-danger'>External protocol not allowed.</div>";
	}
	
	if(avatar==null) avatar="<svg width=\"100\" height=\"100\"><text x=\"10\" y=\"20\" fill=\"blue\">SVG Avatar</text></svg>";
	else{
		try{
			avatar = Util.xmlToString(Util.parseXML(avatar));
		}
		catch(Exception ex){
			avatar="<svg width=\"100\" height=\"100\"><text x=\"10\" y=\"20\" fill=\"red\">Bad Avatar</text></svg>";
			session.setAttribute("cwe611avatar",null);
		}
		
	}
	
	if(displayName==null) displayName = "";
	
	if(avatar.indexOf("root:")!=-1 && original.indexOf("root:")==-1){
		session.setAttribute("cwe611displayName",displayName);
		 //challenge completed
		String code = "";
		try {
			code = CodeLoader.getInstance().getCode("cwe611");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		session.setAttribute(Constants.CHALLENGE_CODE,code);
		successMessage = getYourCodeMarkup;
	
	}



%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>cwe611 - XML External Entity</title>
<link rel="stylesheet" href="public/bootstrap/css/bootstrap.min.css">
<script src="public/jquery.min.js"></script>
<script src="public/bootstrap/js/bootstrap.min.js"></script>
</head>
<body onload="getProfile()">
<nav class="navbar navbar-inverse">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="index.jsp">Insecure Inc.</a>
    </div>
    <ul class="nav navbar-nav">
      <li class="active"><a href="#">XML External Entity</a></li>
     
    </ul>
  </div>
</nav>
<div class="container"> 
<%=successMessage%>
<h1>Welcome to the demo section of the site.  </h1>
<p>You can update how other users of the site view your profile, below.</p>

<form action="Cwe611FileUpload" autocomplete="off" method="POST" enctype="multipart/form-data">
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
    <%=avatar%>
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

