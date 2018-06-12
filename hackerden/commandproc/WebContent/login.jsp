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
		<h1>Command Cat
		<img width="10%" height="10%" src="cat.png">
		</h1>
		<p>LOGIN</p>
	</div>
		
		<p>
		Enter your login document
		</p>
		<form action="LoginDocument" method="post" encType="multipart/form-data">
		<textarea rows="4" cols="80" name="document">&lt;?xml version=&quot;1.0&quot;?&gt;&lt;credentials&gt;&lt;user&gt;admin&lt;/user&gt;&lt;password&gt;&lt;/password&gt;&lt;/credentials&gt;</textarea>
		<br><br>
		<input type="submit" value="Submit">
		</form>


</div>
</html>