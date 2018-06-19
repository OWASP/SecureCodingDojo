<%@ page import="serial.Cat" %>
<%@ page import="java.lang.reflect.*" %>
<%@ page import="inc.insecure.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.security.*" %>
<%

String updateServer = "";

String GET_YOUR_CODE_MARKUP = String.format("<h3>You got it!</h3><a class='btn btn-success' href='%s'>Get your code</a><br><br>", Constants.SECRET_PAGE);
String successMessage = "";
String OUTPUT_PRE_FORMAT = "<label>Contents of '/tmp/'</label><pre>%s</pre>";
String outputPre = "";

boolean challengePassed = false;
if(session==null || session.getAttribute("cwe509loggedin")==null || !(boolean)session.getAttribute("cwe509loggedin")){
	response.sendRedirect("cwe509.jsp?loggedin=false");
}
else{
%>	

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Deserialization of Untrusted Input</title>
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
      <li class="active"><a href="#"> Deserialization of Untrusted Input</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container">
		
		<p>
		<label>Enter your base64 encoded object below:</label>
		</p>
		<form action="SubmitObject" method="post">
		<label>Object:</label><br>
		<textarea rows="4" cols="80" name="object">rO0ABXNyAApzZXJpYWwuQ2F0mJizcryhARMCAAFMAARuYW1ldAASTGphdmEvbGFuZy9TdHJpbmc7eHB0AApTZXJpYWwgQ2F0</textarea>
		<br><br>
		<label>File name to be written to the output directory with serialization:</label><br>
		<input name="filename" id="filename" type="text"/>
		<br><br>
		<input type="submit" value="Submit">
		</form>
<%
	String output = Util.exec("/bin/ls","/tmp");
	challengePassed = session.getAttribute("cwe509challengepassed")!=null && ((boolean)session.getAttribute("cwe509challengepassed"))==true;
	if(challengePassed){
		String code = "";
		try {
			code = CodeLoader.getInstance().getCode("cwe509");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		session.setAttribute(Constants.CHALLENGE_CODE,code);
		successMessage = GET_YOUR_CODE_MARKUP;
	}
	
	outputPre = String.format(OUTPUT_PRE_FORMAT,output);
	if(session.getAttribute("cwe509object") != null){
	
		Object obj = session.getAttribute("cwe509object");

		
		String className = obj.getClass().getName();
		String catName = "N/A";
		Class<?> c = Class.forName(className);
		try
		{
		    Method m = c.getMethod("getName");
		    catName = (String) m.invoke(obj);
		}
		catch(Exception ex){
			catName = ex.getMessage();
		}
		%>
		<pre>
		Class name: <%=className%>
		Cat name: <%=catName%>
		</pre>
		<%
	}
%>
<hr>
<%=successMessage%>	
<%=outputPre%>
</div>
</html>

<%
}
%>