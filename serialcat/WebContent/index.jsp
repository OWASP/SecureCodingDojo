<%@ page import="serial.Cat" %>
<%@ page import="java.lang.reflect.*" %>
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
		<h1>Serial Cat
		<img src="cat.png">
		</h1>
		<p>A Java app that is vulnerable to RCE through deserialization attacks</p>
	</div>
		
		<p>
		Enter your base64 encoded object below:
		</p>
		<form action="SubmitObject" method="post">
		<textarea rows="4" cols="80" name="object">rO0ABXNyAApzZXJpYWwuQ2F0mJizcryhARMCAAFMAARuYW1ldAASTGphdmEvbGFuZy9TdHJpbmc7eHB0AApTZXJpYWwgQ2F0</textarea>
		<br><br>
		<input type="submit" value="Submit">
		</form>
<%
if(session!=null && session.getAttribute("CAT") != null){

	Object obj = session.getAttribute("CAT");
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

</div>
</html>