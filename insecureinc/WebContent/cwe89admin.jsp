<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.security.*" %>
<%

String updateServer = "";

String GET_YOUR_CODE_MARKUP = String.format("<h3>You got it!</h3><a class='btn btn-success' href='%s'>Get your code</a><br><br>", Constants.SECRET_PAGE);
String successMessage = "";


if(session.getAttribute("cwe89loggedin")==null || !(boolean)session.getAttribute("cwe89loggedin")){
	response.sendRedirect("cwe89.jsp?loggedin=false");
}
else{
	
	String code = "";
	try {
		code = CodeLoader.getInstance().getCode("cwe89");
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
	session.setAttribute(Constants.CHALLENGE_CODE,code);
	successMessage = GET_YOUR_CODE_MARKUP;



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
<%=successMessage%>
<h1>Welcome Admin</h1>
<p>Update the server admin settings below. Careful... some of them can alter the server's integrity.</p>
<form action="cwe89admin.jsp" autocomplete="off" method="POST">
<div class="form-inline">
  <label for="email">Admin e-mail:</label>
  <input type="text" class="form-control" id="email" name="email" value="admin@insecure.inc">
</div>
<br>
<div class="form-group">
  <label for="updateServer">Update server:</label>
  <input type="text" class="form-control" id="updateServer" name="updateServer" value="insecure.inc">
</div>

<input type="submit" id="submit" class="btn" value="Update">
</form>
<hr>

</div>
</body>
</html>

<%
}
%>
