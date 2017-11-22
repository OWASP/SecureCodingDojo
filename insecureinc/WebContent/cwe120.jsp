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
String feedbackVisibility="hidden";
String feedback="";

if(pwd!=null){ 
	if(pwd.length()>255){
		alert="<div class='alert alert-danger'>Password too long! No shellcode please.</div>";
	}
	else{
		String output = Util.executeMasterPwd(pwd,"inc/insecure/bufferoverflow.c");
		outputPre = String.format(OUTPUT_PRE_FORMAT,output);
		if(outputPre.contains("PASSWORD VERIFIED") && pwd.indexOf("59563376") ==-1){
			String code = "";
			try {
				code = CodeLoader.getInstance().getCode("cwe120");
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			session.setAttribute(Constants.CHALLENGE_CODE,code);
			successMessage = GET_YOUR_CODE_MARKUP;
		}
		else{
			if(Util.isMatch(pwd, "\0")){
				feedbackVisibility = "";
				feedback = "You got the correct character. Maybe you just need more of it and none of others? You must make both values empty strings ;)";
			}
			if(pwd.indexOf("59563376") !=-1){
				feedbackVisibility = "";
				feedback = "You're going to have to break the program logic through buffer overflow";
			}
			else if(pwd.length()>9 && !Util.isMatch(pwd, "\0")){
				feedbackVisibility = "";
				feedback = "That's right you need lots of characters to overflow the buffer. However strcmp will only stop comparison at the string terminator. See if you can insert a string terminator in the url.";
			}
			else{
				feedbackVisibility = "";
				feedback = "That's right you need lots of characters to overflow the buffer. Keep going!";
			}
		}
	}
}


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>cwe120 - Buffer Overflow</title>
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
      <li class="active"><a href="#">cwe120 - Buffer Overflow</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container"> 
<h3>Welcome to cwe120 - Buffer Overflow!</h3>
<p>Enter the master password to unlock the challenge.</p>
<form action="cwe120.jsp" autocomplete="off" method="GET">
<div class="form-group">
  <label for="pwd">Master Password:</label>
  <input type="password" class="form-control" id="pwd" name="pwd">
</div>
<input type="submit" id="submit" class="btn" value="Submit">
<hr>
<div class="alert alert-info <%=feedbackVisibility%>">
  		<%=feedback%>
</div>
<%=alert%>
<%=successMessage%>

<%=outputPre%>
</form>
</div>
</body>
</html>


