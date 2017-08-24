<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.security.*" %>
<%

String updateServer = "";

String GET_YOUR_CODE_MARKUP = String.format("<h3>You got it!</h3><a class='btn btn-success' href='%s'>Get your code</a><br><br>", Constants.SECRET_PAGE);
String successMessage = "";
String OUTPUT_PRE_FORMAT = "<label>Connectivity test results</label><pre>%s</pre>";
String outputPre = "";

boolean challengePassed = false;
if(session.getAttribute("cwe78loggedin")==null || !(boolean)session.getAttribute("cwe78loggedin")){
	response.sendRedirect("cwe78.jsp?loggedin=false");
}
else{
	updateServer = request.getParameter("updateServer");
	if(updateServer!=null){
		updateServer = updateServer.replace("'","").replace("\"","").replace("`", "").replace("&", "").replace("|", "");
		boolean isValidServer = Util.isValidServerName(updateServer);
		String output = null;
		if(isValidServer){
			//ping the update server
			String [] commandArgs = {"/bin/sh", "-c", String.format("ping -c 4 %s",updateServer)};
			output = Util.exec(commandArgs);
		}
		else if(updateServer.indexOf(';') != -1){
			output = "Yep you got the idea :) but you are only allowed to read /etc/passwd. You need the correct command for that";
		}
		else{
			output = "Invalid server name!";
		}
		
		if(output!=null){
			outputPre = String.format(OUTPUT_PRE_FORMAT,output);
			challengePassed = output.indexOf("root:") != -1;
		}
		
		
		if(challengePassed){
			String code = "";
			try {
				code = CodeLoader.getInstance().getCode("cwe78");
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			session.setAttribute(Constants.CHALLENGE_CODE,code);
			successMessage = GET_YOUR_CODE_MARKUP;
		}
		
	}
	else{
		updateServer = "insecure.inc";
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
<form action="cwe78admin.jsp" autocomplete="off" method="POST">
<div class="form-inline">
  <label for="email">Admin e-mail:</label>
  <input type="text" class="form-control" id="email" name="email" value="admin@insecure.inc">
</div>
<br>
<div class="form-group">
  <label for="updateServer">Update server:</label>
  <input type="text" class="form-control" id="updateServer" name="updateServer" value="<%=updateServer%>">
</div>

<input type="submit" id="submit" class="btn" value="Update">
</form>
<hr>
<%=successMessage%>
<%=outputPre%>

</div>
</body>
</html>

<%
}
%>
