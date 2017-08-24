<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.security.*" %>
<%

String updateServer = "";
if(session.getAttribute("cwe494loggedin")==null || !(boolean)session.getAttribute("cwe494loggedin")){
	response.sendRedirect("cwe494.jsp?loggedin=false");
}
else{
	updateServer = request.getParameter("updateServer");
	if(updateServer!=null){
		if(updateServer.toLowerCase().startsWith("http://evil.bad") || 
		   updateServer.toLowerCase().startsWith("https://evil.bad") ||
		   updateServer.toLowerCase().startsWith("evil.bad")){
			String code = "";
			try {
				code = CodeLoader.getInstance().getCode("cwe494");
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			session.setAttribute(Constants.CHALLENGE_CODE,code);
			response.sendRedirect(Constants.SECRET_PAGE);
		}
	}


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Admin</title>
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
	  <li class="active"><a href="#">Admin</a></li>
	  
    </ul>

  </div>
</nav>
<div class="container"> 
<h1>Welcome Admin</h1>
<p>Update the server admin settings below. Careful... some of them can alter the server's integrity.</p>
<form action="cwe494admin.jsp" autocomplete="off" method="POST">
<div class="form-inline">
  <label for="email">Admin e-mail:</label>
  <input type="text" class="form-control" id="email" name="email" value="admin@insecure.inc">
</div>
<br>
<br>
<div class="form-inline">
  <label for="updateServer">Update server:</label>
  <input type="text" class="form-control" id="updateServer" name="updateServer" value="http://insecure.inc">
</div>
<hr>
<input type="submit" id="submit" class="btn" value="Update">
</form>

</div>
</body>
</html>

<%
}
%>
