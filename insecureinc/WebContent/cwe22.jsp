<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
  <%@ page import="inc.insecure.*" %>
  <%@ page import="java.io.*" %>
<%

String contents = "<div class=\"alert alert-warning\">Be sure to check our newly updated privacy policy below.</div>";
String getYourCodeMarkup = String.format("<h3>You got it!</h3><a class='btn btn-success' href='%s'>Get your code</a>", Constants.SECRET_PAGE);

String file = request.getParameter("file");
String successMessage = "";
String feedbackVisibility="hidden";
String feedback="";

if(file!=null){ 
	file = "public/"+file;
	InputStream input = null;
	BufferedReader reader = null;
	StringBuilder sb = new StringBuilder();
	try {
		input = getServletContext().getResourceAsStream(file);
		
		reader = new BufferedReader(new InputStreamReader(input,"UTF-8"));
        String line = reader.readLine();

        while (line != null) {
            sb.append(line);
            sb.append("\n");
            line = reader.readLine();
        }
	}
    catch(Exception ex){
    	contents = ex.getMessage();
    
    } finally {
        if(reader!=null) reader.close();
    }
	contents = sb.toString();
	
	if(!contents.equals("")){
		if(contents.indexOf("passwordFile")==-1 && contents.indexOf("secret.password")==-1 && contents.indexOf("Lorem ipsum")==-1){
			contents="<div class='alert alert-info'>Nice! You got the idea, but these are not the files you are looking for.</a>";
		}
		else if(contents.contains("secret.password=12345678")){ //they got the password file
			String code = "";
			try {
				code = CodeLoader.getInstance().getCode("cwe22");
				
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			session.setAttribute(Constants.CHALLENGE_CODE,code);
			successMessage = getYourCodeMarkup;
		}
		else{
			feedbackVisibility = "";
			feedback = "Nice you're almost there! See if the path to the password file is anywhere in the response.";

		}
	}
	else{
		//help the user
		if(file.indexOf("..")==-1){
			feedbackVisibility = "";
			feedback = "You need more dots. Did you know path traversal is also known as a 'dot dot slash attack'?";
		}
		else if(file.indexOf("../")==-1){
			feedbackVisibility = "";
			feedback = "You need dots and slashes. Did you know path traversal is also known as a 'dot dot slash attack'?";
		}
		else {
			feedbackVisibility = "";
			feedback = "You got the idea but you don't have the right path yet. Did you know web.xml is usually located in the <code>WEB-INF</code> folder? You're currently in <code>public</code>";
		}
	}
		
	
}


%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>CWE22 - Path Traversal</title>
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
      <li class="active"><a href="cwe22.jsp">CWE22 - Path Traversal</a></li>
  		
    </ul>
  </div>
</nav>


  <div class="panel panel-default">
    <div class="panel-heading"><h3>Welcome to CWE22 - Path Traversal!</h3></div>
    <div class="panel-body">
    	<div class="container"><%=contents%></div>
    	<%=successMessage%>
    	<div class="alert alert-info <%=feedbackVisibility%>">
  		<%=feedback%>
</div>
    </div>
    <div class="panel-footer"><a href="cwe22.jsp?file=privacy.html">Privacy Policy</a></div>
  </div>



</body>
</html>


