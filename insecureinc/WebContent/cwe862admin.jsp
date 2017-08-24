<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%

if(session.getAttribute("cwe862loggedin")==null || !(boolean)session.getAttribute("cwe862loggedin")){
	response.sendRedirect("cwe862.jsp?loggedin=false");
}
else{

	String code = "";
	try {
		code = CodeLoader.getInstance().getCode("cwe862");
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
	session.setAttribute(Constants.CHALLENGE_CODE,code);
	response.sendRedirect(Constants.SECRET_PAGE);	



%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>CWE862 - Missing Authorization - Admin</title>
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
      <li class="active"><a href="#">CWE862 - Missing Authorization Admin</a></li>

    </ul>
    <ul class="nav navbar-nav navbar-right">

        <li><a href="cwe862loggedin.jsp?logout=true"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>
    </ul>
  </div>
</nav>
<div class="container"> 
<h1>Welcome to the Admin section of the site.  </h1>
<p>Nothing to do here.</p>

</body>
</html>

<%
}
%>
