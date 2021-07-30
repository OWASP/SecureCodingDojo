<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="insecure.inc.Constants" %>
<%
if(session.getAttribute(Constants.CHALLENGE_ID)==null){
	response.sendRedirect("index.jsp");
}
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Get Challenge Secret</title>
<link rel="stylesheet" href="public/bootstrap/css/bootstrap.min.css">
<script src="public/jquery.min.js"></script>
<script src="public/bootstrap/js/bootstrap.min.js"></script>
<script>
function getCode(){
	var salt = $("#salt")[0].value;
	$.post("GetCode", {salt:salt}, function(data, status){
		var codeDiv = $("#codeDiv")[0];
		codeDiv.style.display = "";
		var code = $("#code")[0];
		code.value = data;
    });
}
</script>
</head>
<body>
<nav class="navbar navbar-inverse">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" href="index.jsp">Insecure Inc.</a>
    </div>
    <ul class="nav navbar-nav">
      <li class="active"><a href="#">Get Challenge Secret</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container"> 
<h1>Congratulations!!!</h1>
<p>You solved the challenge. To validate your challenge, go to the training portal site and click the corresponding submit code button. 
You will be given a salt which you can enter below. Then provide the resulting code on the training portal site.</p>
<div class="form-group">
  <label for="salt">Salt:</label>
  <input type="text" autocomplete="off" class="form-control" id="salt" name="salt">
</div>
<button type="button" class="btn btn-success" onClick="getCode()">Get Code</button>
<br><br>
<div class="alert alert-info form-group form-inline" style="display:none" id="codeDiv">
	<label for="code">The code is:</label> 
	<input class="form-control" type="text" autocomplete="off" id="code" style="width:40%" value=""/>
	<button type="button" class="btn btn-default" onclick="document.getElementById('code').select();document.execCommand('copy');">
		<span class="glyphicon glyphicon-copy"></span>
	</button>
</div>
</div>
</body>
</html>