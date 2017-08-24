<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="java.util.*" %>
<%@ page import="java.security.*" %>
<%
boolean loggedIn = false;
String tmpPwd = "";
if(session.getAttribute("cwe327loggedin")==null || !(boolean)session.getAttribute("cwe327loggedin")){
	response.sendRedirect("cwe327.jsp?loggedin=false");
}
else{
	loggedIn=true;
		
	tmpPwd=(String)session.getAttribute("cwe327userpassword");
	if(tmpPwd==null){
		//generate a password
		Random r = new Random();
		int val = r.nextInt(1000000);
		tmpPwd = Integer.toString(val);
		session.setAttribute("cwe327userpassword",tmpPwd);
	}
	
	byte [] hash = Crypto.getInstance().getHash(tmpPwd,"SHA-1");
	tmpPwd = Util.bytesToHex(hash);


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
    <ul class="nav navbar-nav navbar-right">
        <li><a href="cwe327loggedin.jsp?logout=true"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>
    </ul>
  </div>
</nav>
<div class="container"> 
<h1>Welcome Admin</h1>
<p>The following is the list of users that are allowed access into the site.</p>
<table class="table table-striped">
	<tr>
		<th>User</th>
		<th>Password</th>
		<th>Temporary password hash</th>
		<th>Notes</th>
	</tr>
	<tr>
		<td>demo</td>
		<td>demo1234</td>
		<td></td>
		<td>Guest account</td>
	</tr>
	<tr>
		<td>user</td>
		<td></td>
		<td><%=tmpPwd%></td>
		<td></td>
	</tr>
</table>
</div>
</body>
</html>

<%
}
%>
