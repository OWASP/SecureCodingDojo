<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%

String alertVisibility="hidden";
String usr = request.getParameter("usr");
String pwd = request.getParameter("pwd");

if(usr!=null && pwd!=null){ 
	alertVisibility="";
	if(usr.equals("demo") && pwd.equals("demo1234")){
		request.getSession().setAttribute("cwe863loggedin", true);
		response.sendRedirect("cwe863loggedin.jsp");
	}
}


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>CWE863 - Incorrect Authorization</title>
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
      <li class="active"><a href="#">CWE863 - Incorrect Authorization</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container"> 
<p>Welcome to CWE863 - Incorrect Authorization! You can use the following guest account credentials to login, 
user: <code>demo</code>, password: <code>demo1234</code> </p>
<form action="cwe863.jsp" autocomplete="off" method="POST">
<div class="form-group">
  <label for="usr">Name:</label>
  <input type="text" class="form-control" id="usr" name="usr">
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


