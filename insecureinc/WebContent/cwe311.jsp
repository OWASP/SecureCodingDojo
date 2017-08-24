<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%
String alertVisibility="hidden";
String usr = request.getParameter("usr");
String pwd = request.getParameter("pwd");

if(usr!=null && pwd!=null){ 
	alertVisibility="";
	if(usr.equals("demo") && pwd.equals("demo1234")){
		request.getSession().setAttribute("cwe311loggedin", true);
		response.sendRedirect("cwe311loggedin.jsp");
	}
	//see if the user account is tried
	if(usr.equals("user")){
		//get the currently generated password from the session
		String sesPwd = (String)session.getAttribute("cwe311userpassword");
		if(sesPwd!=null && sesPwd.equals(pwd)){
			String code = "";
			try {
				code = CodeLoader.getInstance().getCode("cwe311");
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			session.setAttribute(Constants.CHALLENGE_CODE,code);
			response.sendRedirect(Constants.SECRET_PAGE);
		}
	}
}


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>CWE311 - Missing Encryption of Sensitive Data</title>
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
      <li class="active"><a href="#">CWE311 - Missing Encryption of Sensitive Data</a></li>
  		
    </ul>

  </div>
</nav>
<div class="container"> 
<p>Welcome to CWE311 - Missing Encryption of Sensitive Data! You can use the following guest account credentials to login, 
user: <code>demo</code>, password: <code>demo1234</code> </p>
<form action="cwe311.jsp" autocomplete="off" method="POST">
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


