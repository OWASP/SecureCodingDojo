<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="insecure.inc.Util" %>
<%

String alertVisibility="hidden";
String usr = request.getParameter("usr");
String pwd = request.getParameter("pwd");

if(usr!=null && pwd!=null){ 
	alertVisibility="";
	if(usr.equals("admin") && Util.isAdminPassOk(pwd)){
		
		session.setAttribute("cwe494loggedin",true);
		response.sendRedirect("cwe494admin.jsp");
	}
}


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Download of Code Without Integrity Check</title>
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
      <li class="active"><a href="#">Download of Code Without Integrity Check</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container"> 
<h3>Welcome!</h3>
<p> You should have the credentials from the previous challenge, login and see if you can take over the server now.</p>
<form action="cwe494.jsp" autocomplete="off" method="POST">
<div class="form-group">
  <label for="usr">Name:</label>
  <input type="text" class="form-control" id="usr" name="usr" value="admin">
</div>
<!-- disables autocomplete --><input type="text" style="display:none">
<div class="form-group">
  <label for="pwd">Password:</label>
  <input type="password" class="form-control" id="pwd" name="pwd">
</div>
<input type="submit" id="submit" class="btn" value="Submit">
<br><br>
<div class="alert alert-danger <%=alertVisibility%>">
  Invalid credentials!
</div>
</form>
</div>
</body>
</html>


