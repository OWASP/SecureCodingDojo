<%@ page import="serial.*" %>
<%@ page import="java.nio.file.*" %>
<%@ page import="java.util.Arrays" %>
<%@ page import="java.lang.reflect.*" %>
<%@ page import="org.apache.tomcat.util.codec.binary.Base64" %>

<%
boolean loggedin = false;
String secret2 = "";
String secret3 = null;
String error = null;
String className = "";
String catName = "N/A";
if(session!=null){
	if(session.getAttribute("loggedin") != null){
		loggedin = (boolean)session.getAttribute("loggedin");
	}
	if(loggedin && session.getAttribute("CAT") != null){
		
		Object obj = session.getAttribute("CAT");
		className = obj.getClass().getName();
		
		try
		{
			if(className.equals("serial.Command")){
				Command c = (Command)obj;
				Path path = Paths.get("/etc/commandauth.bin");
				byte[] authCode = Files.readAllBytes(path);
				if(!Arrays.equals(c.getAuthCode(),authCode)){
					error="Class authentication code did not match '/etc/commandauth.bin'";
				}
				else if(c.getType() == CommandType.STOP){
					secret3 = System.getProperty("SECRET3");
				}
			}
			if(className.equals("serial.Cat")){
				Cat c = (Cat)obj;
				catName = c.getName();
			}
		    
		}
		catch(Exception ex){
			catName = ex.getMessage();
		}		
	}
}
if(!loggedin){
	response.sendRedirect("login.jsp");
}
else{
	secret2 = System.getProperty("SECRET2");
%>

<!DOCTYPE h1 PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<!-- Optional theme -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

<!-- Latest compiled and minified JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
</head>
<div class="container">
  	<div class="jumbotron">
		<h1>Command Cat
		<img width="10%" height="10%" src="cat.png">
		</h1>
		<p>Control
		<div class="alert alert-success">Good for you! You got this far. Here's your challenge code url: <%=secret2%></div>
		</p>
		<div></div>
	</div>
		
		<p>
		Enter your base64 command object below:
		</p>
		<form action="SubmitCommand" method="post" encType="multipart/form-data">
		<textarea rows="4" cols="80" name="object">rO0ABXNyAApzZXJpYWwuQ2F0mJizcryhARMCAAFMAARuYW1ldAASTGphdmEvbGFuZy9TdHJpbmc7eHB0AApTZXJpYWwgQ2F0</textarea>
		<br><br>
		<input type="submit" value="Submit">
		</form>
		
		<pre>
		Class name: <%=className%>
		Cat name: <%=catName%>
		</pre>
		<%
		if(secret3!=null){
		%>
		<div class="alert alert-success">You're awesome! You have sent the stop command. Here's your challenge code url: <%=secret3%></div>
		<%
		}
		
		if(error!=null){
		%>
		<div class="alert alert-danger"><%=error%></div>
		<%
		}
		%>
		<!-- 
		<hr>
		<p>
		Generate a command object:
		</p>
		<form action="GetCommand" method="post" encType="multipart/form-data">
		Auth Code:
		<br>
		<textarea rows="4" cols="80" name="authCode">base64 binary...</textarea>
		<br><br>
		Type:
		<select name="type">
			<option value="STOP">Stop</option>
			<option value="EXEC">Exec</option>
			<option value="UPLOAD">Upload</option>
		</select>
		<br><br>
		Target:
		<input type="text" name="target">
		<br><br>
		Argument:
		<input type="text" name="argument">
		<br><br>
		<input type="submit" value="Submit">
		</form>
		 -->

</div>
</html>

<%
}
%>