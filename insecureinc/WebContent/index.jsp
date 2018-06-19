<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insecure Inc.</title>
<link rel="stylesheet" href="public/bootstrap/css/bootstrap.min.css">
<script src="public/jquery.min.js"></script>
<script src="public/bootstrap/js/bootstrap.min.js"></script>

<style>
body {
    position: relative; 
}

.section{    
    padding-left: 75px;
    min-height: 600px;
}
.section .p{
  font-size: 50px;
}

#about {color: #fff; text-shadow:2px 2px 5px darkslateblue; background-image: url('public/banner.jpg')}

.transparent {
    background-color: transparent;
}


#bottom{
    color: #fff;
    background-color:#000;
}
</style>



</head>
<body data-spy="scroll" data-target=".navbar" data-offset="50">

<nav class="navbar navbar-inverse navbar-fixed-top">
  <div class="container-fluid">
    <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>                        
      </button>
      <a class="navbar-brand" href="#">Insecure Inc.</a>
    </div>
    <div>
      <div class="collapse navbar-collapse" id="myNavbar">
        <ul class="nav navbar-nav">
          <li class="dropdown">
		        <a class="dropdown-toggle" data-toggle="dropdown" href="">Challenges
		        <span class="caret"></span></a>
		        <ul class="dropdown-menu">
		          <li><a href="ch1.jsp">Missing Authentication for Critical Function</a></li>
		          <li><a href="ch2.jsp">Reliance on Untrusted Inputs in a Security Decision </a></li>
		          <li><a href="cwe862.jsp">Missing Authorization</a></li>
		          <li><a href="cwe311.jsp">Missing Encryption for Sensitive Data</a></li>
		          <li><a href="cwe327.jsp">Use of a Broken or Risky Cryptographic Algorithm</a></li>
		          <li><a href="cwe759.jsp">Use of a One-Way Hash without a Salt</a></li>
		          <li><a href="cwe307.jsp">Improper Restriction of Excessive Authentication Attempts</a></li>
		          <li><a href="cwe190.jsp">Integer Overflow or Wraparound</a></li>
		          <li><a href="cwe494.jsp">Download of Code Without Integrity Check</a></li>
		          <li><a href="cwe601.jsp">URL Redirection to Untrusted Site ('Open Redirect')</a></li>
		          <li><a href="cwe79.jsp">Cross-Site Scripting</a></li>
		          <li><a href="cwe352.jsp">Cross-Site Request Forgery</a></li>
		          <li><a href="cwe611.jsp">XML External Entity</a></li>
		          <li><a href="cwe434.jsp">Unrestricted Upload of File with Dangerous Type</a></li>
		          <li><a href="cwe863.jsp">Incorrect Authorization</a></li>
		          <li><a href="cwe22.jsp">Path Traversal</a></li>
		          <li><a href="cwe78.jsp">OS Command Injection</a></li>
		          <li><a href="cwe509.jsp">Deserialization of Untrusted Input</a></li>
		          <li><a href="cwe89.jsp">SQL Injection</a></li>
		          <li><a href="cwe120.jsp">Buffer Overflow</a></li>
		          <li><a href="cwe134.jsp">Uncontrolled Format String</a></li>
		          <li><a href="quiz.jsp">Quiz</a></li>
		        </ul>
		 	</li>
        </ul>
        
      </div>
    </div>
  </div>
</nav>    

<div id="about" class="container-fluid section">
    <div class="jumbotron transparent">
        <h1>Welcome to Insecure Inc.</h1> 
        <h2>This is a training site. You are authorized to complete the training challenges.
         You are <strong>not</strong> authorized to conduct any disruptive testing or intentionally tamper 
        with the contents of this site. </h2>
        
    </div>
</div>
<div id="bottom" class="container-fluid section">
    <div class="jumbotron transparent">
     </div>
</div>
</body>
</html>