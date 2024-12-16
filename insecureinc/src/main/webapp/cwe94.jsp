<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="insecure.inc.Constants" %>
<%@ page import="insecure.inc.Util" %>
<%
    String alertVisibility = "hidden";
    String query = request.getParameter("query");

    if (query != null) {
      query = query.trim();
      alertVisibility = "";
    }

    String result = Util.executeJavascript(query);

    if (result == "solved") {
			session.setAttribute(Constants.CHALLENGE_ID,"cwe94");
			response.sendRedirect(Constants.SECRET_PAGE);
		}
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Improper Control of Generation of Code ('Code Injection')</title>
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
        <li class="active"><a href="#">Improper Control of Generation of Code ('Code Injection')</a></li>
      </ul>
    </div>
  </nav>
<div class="container"> 
<h1>Welcome to CWE94 - Improper Control of Generation of Code ('Code Injection')!</h1>
<p>Please enter your mathematical operation and the backend JavaScript engine will provide the result.</p>
<form action="cwe94.jsp" autocomplete="off" method="POST">
    <div class="form-group">
      <label for="expression">Mathematical Expression:</label>
      <input type="text" class="form-control" id="expression" name="query">
    </div>
    <input type="submit" id="submit" class="btn" value="Submit">
    <br><br>
    <div class="alert alert-danger <%=alertVisibility%>">
      Result: <%=result%>
    </div>
    </form>
</div>
</body>
</html>