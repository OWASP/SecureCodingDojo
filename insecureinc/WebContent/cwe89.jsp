<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="java.sql.*" %>
<%

String alertVisibility="hidden";
String usr = request.getParameter("usr");
String pwd = request.getParameter("pwd");
String exMessage = "";
if(usr!=null && pwd!=null){ 
	
	//check if the database exists
	EmbeddedDB db = (EmbeddedDB)session.getAttribute("cwe89db");
	if(db==null){
		db = new EmbeddedDB();
		db.createDB();
		session.setAttribute("cwe89db",db);
	}
	usr = usr.replace("-","");
	pwd = pwd.replace("-","");
	Connection conn = db.getConn();
	int count=0;
	String query = String.format("select * from users where usr='%s' and pwd='%s'",usr,pwd);
	try{
		Statement stmt = conn.createStatement();		
		ResultSet rs = stmt.executeQuery(query);	
		
	    while (rs.next()) {
	       count++;
	    }
	}
	catch(SQLException ex){
		exMessage = String.format("<pre>%s\nQuery:<mark>%s</mark></pre>",ex,query);
	}
	alertVisibility="";
	if(count==1){
		db.drop();
		session.setAttribute("cwe89db", null);
		session.setAttribute("cwe89loggedin",true);
		response.sendRedirect("cwe89admin.jsp");
	}
}


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>SQL Injection</title>
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
      <li class="active"><a href="#">SQL Injection</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container"> 
<h3>Welcome!</h3>
<p> The admin has set a very complicated password. No brute forcing can help you. But is there another way in?</p>
<form action="cwe89.jsp" autocomplete="off" method="POST">
<div class="form-group">
  <label for="usr">Name:</label>
  <input type="text" class="form-control" id="usr" name="usr" value="admin">
</div>
<!-- disables autocomplete --><input type="text" style="display:none">
<div class="form-group">
  <label for="pwd">Password:</label>
  <input type="password" class="form-control" id="pwd" name="pwd">
</div>
<input type="submit" id="submit" class="btn" value="Submit">
<br><br>
<div class="alert alert-danger <%=alertVisibility%>">
  Invalid credentials!
</div>
<%=exMessage%>
</form>
</div>
</body>
</html>


