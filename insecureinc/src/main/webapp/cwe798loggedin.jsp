<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%
if(session.getAttribute("cwe798loggedin")==null || !(boolean)session.getAttribute("cwe798loggedin") || request.getParameter("logout")!=null){
	session.setAttribute("cwe798loggedin",false);
	response.sendRedirect("cwe798.jsp?loggedin=false");
}
else{
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Guest</title>
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
      <li class="active"><a href="#">Guest</a></li>
    </ul>
    <ul class="nav navbar-nav navbar-right">
        <li><a href="cwe798loggedin.jsp?logout=true"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>
    </ul>
  </div>
</nav>
<div class="container"> 
<h1>Welcome to the guest section of the site.</h1>
<p>In order to fully utilize Insecure Inc. you must perform a system test to confirm your system has the minimum operating requirements.</p>
<p>To perform the system test, you must have Java installed. Then download the <a href="validate.jar">Insecure Inc. System Validator</a> and run the following command:</p>
<pre class="pre-scrollable">java -jar validate.jar</pre>
</div>
</body>
</html>
<% 
}
%>