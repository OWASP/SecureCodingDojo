<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%
if(session.getAttribute(Constants.CHALLENGE_CODE)==null){
	//response.sendRedirect("index.jsp");
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
function unlock(){
	var unlockCode = $("#unlockCode")[0].value;
	$.post("SetUnlockCode", {unlockCode:unlockCode}, function(data, status){
		if(data!=="OK"){
			var codeDiv = $("#messageDiv")[0];
			codeDiv.style.display = "";
			var message = $("#message")[0];
			message.contentText = message.innerText = data;
		}
		else{
			window.location = "SetUnlockCode"; 
		}
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
      <li class="active"><a href="#">Unlock Challenge</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container"> 
<h1>Welcome!</h1>
<p>Enter the unlock code for today's session. The unlock code will be provided to you by your instructor.</p>
<div class="form-group">
  <label for="unlockCode">Unlock code:</label>
  <input type="text" class="form-control" id="unlockCode" name="unlockCode">
</div>
<button type="button" class="btn btn-success" onClick="unlock()">Unlock</button>
<br><br>
<div class="alert alert-info" style="display:none" id="messageDiv"><code id="message"></code></div>
</div>
</body>
</html>