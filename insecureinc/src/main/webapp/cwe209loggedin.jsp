<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%
if(session.getAttribute("cwe209loggedin")==null || !(boolean)session.getAttribute("cwe209loggedin") || request.getParameter("logout")!=null){
	session.setAttribute("cwe209loggedin",false);
	response.sendRedirect("cwe209.jsp?loggedin=false");
}
else{
    String alertVisibility="hidden";
    String query = request.getParameter("query");

    if(query!=null){ 
        if(query.contains("'") || query.contains("<") || query.contains(">") || query.contains("#") || query.contains("-") || query.contains("=")){
            try{
                throw new RuntimeException("Error: unexpected character in query '" + query + "' using connection jdbc:mysql://localhost:3306/insecureinc?user=svc.database.insecure.inc&password=OWASP_R0ckZ!");
            }
            catch (Exception e){
                e.printStackTrace(response.getWriter());
            }
        }
        else{
            alertVisibility="";
        }
    }
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
        <li><a href="cwe209loggedin.jsp?logout=true"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>
    </ul>
  </div>
</nav>
<div class="container"> 
<h1>Welcome to the guest section of the site.</h1>
<p>Please enter your search term to return results from the Insecure Inc. archive.</p>
<form action="cwe209loggedin.jsp" autocomplete="off" method="POST">
    <div class="form-group">
      <label for="search">Search:</label>
      <input type="text" class="form-control" id="search" name="query">
    </div>
    <input type="submit" id="submit" class="btn" value="Submit">
    <br><br>
    <div class="alert alert-danger <%=alertVisibility%>">
      No results found for '<%=query%>'!
    </div>
    </form>
</div>
</body>
</html>
<% 
}
%>