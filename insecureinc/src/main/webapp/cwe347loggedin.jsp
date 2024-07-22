<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="insecure.inc.Constants" %>
<%@ page import="com.auth0.jwt.JWT" %>
<%@ page import="com.auth0.jwt.interfaces.DecodedJWT" %>
<%@ page import="com.auth0.jwt.algorithms.Algorithm" %>
<%

String authCookieValue = null;
Cookie[] cookies = request.getCookies();

if(request.getParameter("logout") != null) {
    Cookie auth = new Cookie("auth", "");
    auth.setMaxAge(0);
    response.addCookie(auth);
	response.sendRedirect("cwe347.jsp?loggedin=false");
}

if (cookies != null) {
    for (Cookie cookie : cookies) {
        if (cookie.getName().equals("auth")) {
            authCookieValue = cookie.getValue();
        }
    }
}

if(authCookieValue != null) {
    String role;

    try {
        DecodedJWT jwt = JWT.decode(authCookieValue);
        role = jwt.getClaim("role").asString();

        if (role.equals("admin")) {
            session.setAttribute(Constants.CHALLENGE_ID,"cwe347");
            response.sendRedirect(Constants.SECRET_PAGE);
        }
    } catch(Exception e) {
        role = e.toString();
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
        <li><a href="cwe347loggedin.jsp?logout=true"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>
    </ul>
    
  </div>
</nav>
<div class="container"> 
<h1>Welcome to the guest section of the site.  </h1>
<p>Nothing to do here.</p>
<p>User role: <%=role%></p>
</div>
</body>
</html>
<% 
}
else {
    response.sendRedirect("cwe347.jsp?loggedin=false");
}
%>
