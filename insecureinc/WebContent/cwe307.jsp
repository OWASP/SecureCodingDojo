<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%

String alertVisibility="hidden";
String usr = request.getParameter("usr");
String pwd = request.getParameter("pwd");

if(usr!=null && pwd!=null){ 
	alertVisibility="";
	if(usr.equals("admin") && Util.isAdminPassOk(pwd)){
		String code = "";
		try {
			code = CodeLoader.getInstance().getCode("cwe307");
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
<title>CWE307</title>
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
      <li class="active"><a href="#">CWE307</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container"> 
<h3>Welcome to CWE307!</h3>
<p> Sorry, this time you will have to brute force your way in. By the way, did you know
that a <a target="_blank" href="https://www.theregister.co.uk/2010/01/21/lame_passwords_exposed_by_rockyou_hack/">
famous hack</a> of the RockYou site exposed 32 million passwords which have since been used in pen-testing?</p>
<form action="cwe307.jsp" autocomplete="off" method="POST">
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


