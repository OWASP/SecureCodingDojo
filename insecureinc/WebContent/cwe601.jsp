<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%

String alertVisibility="hidden";
String usr = request.getParameter("usr");
String pwd = request.getParameter("pwd");
String redirect = request.getParameter("redirect");
if(usr!=null && pwd!=null){ 
	alertVisibility="";
}
if(redirect!=null){

	if(redirect.toLowerCase().startsWith("http://evil.bad") || redirect.toLowerCase().startsWith("https://evil.bad")){
		String code = "";
		try {
			code = CodeLoader.getInstance().getCode("cwe601");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		session.setAttribute(Constants.CHALLENGE_CODE,code);
		response.sendRedirect(Constants.SECRET_PAGE);
	}
}
else{
	response.sendRedirect("cwe601.jsp?redirect=index.jsp");
}
	


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Open Redirect</title>
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
      <li class="active"><a href="#">Open Redirect</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container"> 
<h3>Welcome to Open Redirect!</h3>
<p> Sorry, the admin has set their password to a secure value. Maybe you can trick them into giving it to you...</p>
<form action="cwe601.jsp?redirect=<%=redirect%>>" autocomplete="off" method="POST">
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


