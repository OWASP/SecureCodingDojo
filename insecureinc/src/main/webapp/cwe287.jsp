<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="insecure.inc.Constants" %>
<%
    String authCookieValue = null;
    Cookie[] cookies = request.getCookies();
    String cookieName = "isAuthenticated";
    String alertVisibility="hidden";
    String usr = request.getParameter("usr");
    String pwd = request.getParameter("pwd");

    if (usr != null && pwd != null) { 
      alertVisibility = "";
    }
    
    if (cookies != null) {
      for (int i = 0; i < cookies.length; i++) {
        Cookie cookie = cookies[i];

        if (cookie.getName().equals(cookieName)) {
          authCookieValue = cookie.getValue();
        }
      }
    }

    if (authCookieValue != null && authCookieValue.equals("true")) {
      session.setAttribute(Constants.CHALLENGE_ID,"cwe287");
      response.sendRedirect(Constants.SECRET_PAGE);	
    }
    else {
      if (authCookieValue == null) {
        Cookie cookie = new Cookie(cookieName, "false");
        cookie.setMaxAge(60*60*24);
        response.addCookie(cookie);
      }
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>CWE287 - Improper Authentication</title>
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
      <li class="active"><a href="#">CWE287 - Improper Authentication</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container">
<p>Welcome to CWE287 - Improper Authentication!</p>
<form action="cwe287.jsp" autocomplete="off" method="POST">
<div class="form-group">
  <label for="usr">Name:</label>
  <input type="text" class="form-control" id="usr" name="usr">
</div>
<input type="text" style="display:none">
<div class="form-group">
  <label for="pwd">Password:</label>
  <input type="password" class="form-control" id="pwd" name="pwd">
</div>
<input type="submit" id="submit" class="btn" value="Submit">
<br><br>
<div class="alert alert-danger <%=alertVisibility%>">
  Invalid credentials!
</div>
</form>
</div>
</body>
</html>
<%    
    } 
%>