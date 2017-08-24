<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    
<%@ page import="inc.insecure.*" %>
<%

String GET_YOUR_CODE_MARKUP = String.format("<h3>You got it!</h3><a class='btn btn-success' href='%s'>Get your code</a><br><br>", Constants.SECRET_PAGE);
String successMessage = "";
String OUTPUT_PRE_FORMAT = "<label>Master password command output:</label><pre>%s</pre>";
String outputPre = "";
String alert = "";
String pwd = request.getParameter("pwd");

if(pwd!=null){ 
	if(pwd.length()>20){
		alert="<div class='alert alert-danger'>Password too long! No shellcode please.</div>";
	}
	else{
		String output = Util.executeMasterPwd(pwd,"inc/insecure/formatstring.c");
		outputPre = String.format(OUTPUT_PRE_FORMAT,output);
		if(Util.isMatch(output,"password:.*\\d") && !Util.isMatch(pwd,"\\d")){
			String code = "";
			try {
				code = CodeLoader.getInstance().getCode("cwe134");
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			session.setAttribute(Constants.CHALLENGE_CODE,code);
			successMessage = GET_YOUR_CODE_MARKUP;
		}
	}
}


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>cwe134 - Use of Externally-Controlled Format String</title>
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
      <li class="active"><a href="#">cwe134 - Use of Externally-Controlled Format String</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container"> 
<h3>Welcome to cwe134 - Uncontrolled Format String!</h3>
<p>Enter the master password to unlock the challenge.</p>
<form action="cwe134.jsp" autocomplete="off" method="GET">
<div class="form-group">
  <label for="pwd">Master Password:</label>
  <input type="password" class="form-control" id="pwd" name="pwd">
</div>
<input type="submit" id="submit" class="btn" value="Submit">
<hr>
<%=alert%>
<%=successMessage%>
<%=outputPre%>
</form>
</div>
</body>
</html>


