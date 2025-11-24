<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="insecure.inc.Constants" %>
<%

String alertVisibility = "hidden";
String error = "";
String logoutParameter = request.getParameter("logout");

if(logoutParameter!=null){
  if(logoutParameter.equals("true")){
    response.sendRedirect("cwe20.jsp?loggedin=false");	
  }
}

if(session == null || session.getAttribute("cwe20loggedin") == null || !(boolean)session.getAttribute("cwe20loggedin")) {
	response.sendRedirect("cwe20.jsp?loggedin=false");
}
else {
  String cost = request.getParameter("cost");
  int costParsed = 0;

  try {
    costParsed = Integer.parseInt(cost);
  } catch (Exception e) {
    cost = null;
  }

  if(cost != null) {
    alertVisibility = "";

    if(costParsed == 0) {
      error = "The subscription amount cannot be zero!";
    } else if (costParsed > 0) {
      error = "Subscription was renewed!";
    } else {
      session.setAttribute(Constants.CHALLENGE_ID,"cwe20");
      response.sendRedirect(Constants.SECRET_PAGE);
    }
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
        <li><a href="cwe20loggedin.jsp?logout=true"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>
    </ul>
    
  </div>
</nav>
<div class="container"> 
<h1>Time to renew your subscription for Insecure Inc.</h1>
<p>Select your payment method and purchase your next year of service</p>
<form action="cwe20loggedin.jsp" autocomplete="off" method="POST">
    <div class="form-group">
      <label for="payment">Payment Method:</label>
      <select name="payment" id="payment">
        <option value="1" selected>Visa card ending *2356</option>
      </select>
      <input type="hidden" class="form-control" id="cost" name="cost" value="60">
    </div>
    <input type="submit" id="submit" class="btn" value="Submit">
    <br>
    <br>
    After submitting your renewal, you will see a charge of $60 on your statement under "Insecure Inc."
    <br>
    <br>
    <div class="alert alert-danger <%=alertVisibility%>">
      <%=error%>
    </div>
    </form>
</div>
</body>
</html>
