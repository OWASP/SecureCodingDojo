<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="inc.insecure.*" %>
<%@ page import="java.util.*" %>
<%!

String isCorrect(HashMap solutions,HashMap answers,String qId){
	String solution = (String)solutions.get(qId);
	String answer = (String)answers.get(qId);
	if(solution==null || answer==null) return "UNKNOWN";
	if(solution.equals(answer)) return "CORRECT";
	return "INCORRECT";
}
String getIncorrectMessage(HashMap solutions,HashMap answers,String qId){
	String message = "<div class='alert alert-danger'>Incorrect answer!</div>";
	if(isCorrect(solutions, answers, qId).equals("INCORRECT")) return message;
	return "";
}
String getSuccessMessage(HashMap solutions,HashMap answers,String qId){
	String message = "<div class='alert alert-success'>Correct!</div>";
	if(isCorrect(solutions, answers, qId).equals("CORRECT")) return message;
	return "";
}

String getOption(HashMap answers,String qId,String choiceId,String text){
	String answer = (String)answers.get(qId);
	String checked = "";
	if(answer!=null && answer.equals(choiceId)) checked="checked";
	String format = "<div class='radio'><label>"+
	"<input type='radio' name='%s' value='%s' %s>%s</label></div>";
	String markup = String.format(format, qId, choiceId, checked, text);
	
	return markup;
}
%>
<%
String getYourCodeMarkup = String.format("<h3>You got it!</h3><a class='btn btn-success' href='%s'>Get your code</a>", Constants.SECRET_PAGE);
String successMessage = "";

HashMap<String, String> solutions = new HashMap<String, String>();
solutions.put("q1","3");
solutions.put("q2","4");
solutions.put("q3","2");
solutions.put("q4","1");
solutions.put("q5","2");
solutions.put("q6","3");
solutions.put("q7","1");
solutions.put("q8","1");
solutions.put("q9","2");
solutions.put("q10","4");
solutions.put("q11","2");
solutions.put("q12","3");
solutions.put("q13","2");
solutions.put("q14","1");
solutions.put("q15","4");
solutions.put("q16","3");
solutions.put("q17","4");
solutions.put("q18","1");
solutions.put("q19","3");
solutions.put("q20","2");
solutions.put("q21","2");
solutions.put("q22","4");
solutions.put("q23","3");
solutions.put("q24","3");
solutions.put("q25","1");

HashMap<String, String> answers = new HashMap<String, String>();
Iterator it = solutions.entrySet().iterator();
int score = 0;
int total = 0;
while (it.hasNext()) {
	total++;
    Map.Entry pair = (Map.Entry)it.next();
    String qId = (String)pair.getKey();
    String answer = request.getParameter(qId);
    if(answer!=null){
    	answers.put(qId, answer);
    	if(answer.equals(pair.getValue())) score++;
    }
}
String scoreMessage = "";
if(score>0){
	scoreMessage = String.format("<div class='alert alert-info'>Your score is %d out of %d</div>",score,total);
	if(score==total){
		
		String code = "";
		try {
			code = CodeLoader.getInstance().getCode("quiz");
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		session.setAttribute(Constants.CHALLENGE_CODE,code);
		successMessage = getYourCodeMarkup;
	
	}
}

%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Quiz</title>
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
      <li class="active"><a href="#">Quiz</a></li>
  		
    </ul>
  </div>
</nav>
<div class="container"> 
<h3>Test your knowledge.</h3>
<p>Are you prepared to block software attacks? Complete the quiz below to find out.</p>

<%=scoreMessage %>
<%=successMessage %>
<hr>
<form action="quiz.jsp" autocomplete="off" method="POST">

<h4>Question 1</h4>
<%=getIncorrectMessage(solutions,answers,"q1")%><%=getSuccessMessage(solutions,answers,"q1")%>
<blockquote>
What authentication strategy is best fit for a Java EE multi-user application which contains a public section and a restricted area?
</blockquote>
<%=getOption(answers,"q1","1","Enforce authentication on every page public or not.")%>
<%=getOption(answers,"q1","2","Implement an authentication filter, allow access to all resources with the exception of the restricted area.")%>
<%=getOption(answers,"q1","3","Implement an authentication filter, restrict access to all resources with the exception of the public area.")%>
<%=getOption(answers,"q1","4","Perform authentication in each JSP as needed.")%>
<hr>


<h4>Question 2</h4>
<%=getIncorrectMessage(solutions,answers,"q2")%><%=getSuccessMessage(solutions,answers,"q2")%>
<blockquote>
Which of the options below best describes how to identify a user's role?
</blockquote>
<%=getOption(answers,"q2","1","<pre>String role=request.getParameter(\"role\");</pre>")%>
<%=getOption(answers,"q2","2","<pre>String uid=request.getParameter(\"id\"); String role = Database.getRole(uid); </pre>")%>
<%=getOption(answers,"q2","3","<pre>String role=document.cookie.indexOf('isAdmin')!=-1</pre>")%>
<%=getOption(answers,"q2","4","<pre>String role=(String)session.getAttribute(\"role\");</pre>")%>
<hr>


<h4>Question 3</h4>
<%=getIncorrectMessage(solutions,answers,"q3")%><%=getSuccessMessage(solutions,answers,"q3")%>
<blockquote>
What is the best method to avoid Authorization Bypass issues?
</blockquote>
<%=getOption(answers,"q3","1","Conduct static analysis scans regularly.")%>
<%=getOption(answers,"q3","2","Refactor the code so functionality is separated according to roles.")%>
<%=getOption(answers,"q3","3","Check the roles in each Servlet and perfom code reviews to ensure logical issues are avoided.")%>
<%=getOption(answers,"q3","4","Using platform authentication.")%>
<hr>

<h4>Question 4</h4>
<%=getIncorrectMessage(solutions,answers,"q4")%><%=getSuccessMessage(solutions,answers,"q4")%>
<blockquote>
What is the best way to store user passwords in a database?
</blockquote>
<%=getOption(answers,"q4","1","Use pbkdf2 with 10000 iteration and a salt.")%>
<%=getOption(answers,"q4","2","Use asymetric encryption, RSA with 2048 key size.")%>
<%=getOption(answers,"q4","3","Hash the passwords with a SHA-2 algorithm")%>
<%=getOption(answers,"q4","4","Use pbkdf5")%>
<hr>


<h4>Question 5</h4>
<%=getIncorrectMessage(solutions,answers,"q5")%><%=getSuccessMessage(solutions,answers,"q5")%>
<blockquote>
Which of the following hashing algorithms is NOT outdated?
</blockquote>
<%=getOption(answers,"q5","1","SHA-1")%>
<%=getOption(answers,"q5","2","SHA-2")%>
<%=getOption(answers,"q5","3","MD5")%>
<%=getOption(answers,"q5","4","XOR")%>
<hr>


<h4>Question 6</h4>
<%=getIncorrectMessage(solutions,answers,"q6")%><%=getSuccessMessage(solutions,answers,"q6")%>
<blockquote>
Which communication protocol would you select for your SSL server configuration ?
</blockquote>
<%=getOption(answers,"q6","1","SSLv3. It is the best protocol for compatibility with all browsers.")%>
<%=getOption(answers,"q6","2","TLS1.0. It is stronger than SSL and supported by all browsers")%>
<%=getOption(answers,"q6","3","TLS1.2. It is the most secure.")%>
<%=getOption(answers,"q6","4","Custom protocol based on AES 256 ECB encryption algorithm.")%>
<hr>

<h4>Question 7</h4>
<%=getIncorrectMessage(solutions,answers,"q7")%><%=getSuccessMessage(solutions,answers,"q7")%>
<blockquote>
You are implementing a SSL client but your test server has a self signed certificate and the connection fails.
</blockquote>
<%=getOption(answers,"q7","1","Import the self signed certificate in your Java trusted store.")%>
<%=getOption(answers,"q7","2","Disable certificate validation the connection is encrypted anyways.")%>
<%=getOption(answers,"q7","3","Disable certificate validation for the time being. Re-enable it back at the end of the sprint.")%>
<%=getOption(answers,"q7","4","Make no changes to your dev environment. Use a http:// url.")%>
<hr>


<h4>Question 8</h4>
<%=getIncorrectMessage(solutions,answers,"q8")%><%=getSuccessMessage(solutions,answers,"q8")%>
<blockquote>
The following snippets represent an account lockout mechanism. Which of the following choices has a vulnerability?
</blockquote>
<%=getOption(answers,"q8","1","<pre>short tries=(short)session.getAttribute(\"tries\"); tries++; isLockedOut=tries&gt;5; session.setAttribute(\"tries\",tries);</pre>")%>
<%=getOption(answers,"q8","2","<pre>short tries=(short)session.getAttribute(\"tries\"); isLockedOut=tries&gt;5;</pre>")%>
<%=getOption(answers,"q8","3","<pre>short tries=(short)session.getAttribute(\"tries\"); if(tries&lt;MAX_SHORT) tries++; isLockedOut=tries&gt;5; session.setAttribute(\"tries\",tries);</pre>")%>
<hr>


<h4>Question 9</h4>
<%=getIncorrectMessage(solutions,answers,"q9")%><%=getSuccessMessage(solutions,answers,"q9")%>
<blockquote>
Which of the following statements about account lockout is contrary to security best practices.?
</blockquote>
<%=getOption(answers,"q9","1","Two factor authentication prevents password guessing attacks.")%>
<%=getOption(answers,"q9","2","It is the user's responsibility to configure a strong password. Brute force attacks won't work against a good password")%>
<%=getOption(answers,"q9","3","When handling user authentication, applications should provide account lockout and password policy enforcement mechanisms.")%>
<hr>


<h4>Question 10</h4>
<%=getIncorrectMessage(solutions,answers,"q10")%><%=getSuccessMessage(solutions,answers,"q10")%>
<blockquote>
Which is the best way to ensure the integrity of software updates?
</blockquote>
<%=getOption(answers,"q10","1","Hash the software with a SHA-2 hash and ship the hash along with the update package.")%>
<%=getOption(answers,"q10","2","Encrypt the software with a hard-coded password and download over unencrypted connection to improve performance.")%>
<%=getOption(answers,"q10","3","Download the valid over trusted, secure connection. Reject invalid download server certificates.")%>
<%=getOption(answers,"q10","4","Create a SHA-2 digest for the updates and encrypt the hash with the software provider private key. Download over valid SSL.")%>
<hr>

<h4>Question 11</h4>
<%=getIncorrectMessage(solutions,answers,"q11")%><%=getSuccessMessage(solutions,answers,"q11")%>
<blockquote>
Which of the snippets below has a security issue?
</blockquote>
<%=getOption(answers,"q11","1","<pre>response.sendRedirect(\"http://google.com\");</pre>")%>
<%=getOption(answers,"q11","2","<pre>response.sendRedirect(request.getParameter(\"redirect\"));</pre>")%>
<%=getOption(answers,"q11","3","<pre>response.sendRedirect(UrlResourceManager.get(request.getParameter(\"pageId\")));</pre>")%>
<hr>

<h4>Question 12</h4>
<%=getIncorrectMessage(solutions,answers,"q12")%><%=getSuccessMessage(solutions,answers,"q12")%>
<blockquote>
Which of the following is the most effective countermeasure against XSS
</blockquote>
<%=getOption(answers,"q12","1","Input Whitelisting")%>
<%=getOption(answers,"q12","2","Sanitize output. Remove tag symbols.")%>
<%=getOption(answers,"q12","3","Whitelist input where possible. Neutralize output through output encoding and safe DOM updates.")%>
<%=getOption(answers,"q12","4","Blacklist any values containing the following regex: 'img|script|on|iframe'")%>
<hr>


<h4>Question 13</h4>
<%=getIncorrectMessage(solutions,answers,"q13")%><%=getSuccessMessage(solutions,answers,"q13")%>
<blockquote>
Which of the following HTTP response headers prevents "Inclusion of Functionality from Untrusted Control Sphere" 
and increases the attack complexity for XSS.
</blockquote>
<%=getOption(answers,"q13","1","<pre>X-XSS-Protection: 1; mode=block</pre>")%>
<%=getOption(answers,"q13","2","<pre>Content-Security-Policy: script-src ‘self’</pre>")%>
<%=getOption(answers,"q13","3","<pre>X-Frame-Options:deny</pre>")%>
<%=getOption(answers,"q13","4","<pre>Strict-Transport-Security: max-age=31536000</pre>")%>
<hr>


<h4>Question 14</h4>
<%=getIncorrectMessage(solutions,answers,"q14")%><%=getSuccessMessage(solutions,answers,"q14")%>
<blockquote>
Which is the most effective protection against Cross-Site Request Forgery?
</blockquote>
<%=getOption(answers,"q14","1","Add an additional authentication header to the request that is not a cookie or platform authentication.")%>
<%=getOption(answers,"q14","2","Check that the referer header matches the host of the application.")%>
<%=getOption(answers,"q14","3","Enforce platform authentication")%>
<%=getOption(answers,"q14","4","Add a forgery prevention image during authentication.")%>
<hr>


<h4>Question 15</h4>
<%=getIncorrectMessage(solutions,answers,"q15")%><%=getSuccessMessage(solutions,answers,"q15")%>
<blockquote>
Which of the following extensions is considered dangerous during a file upload to a Java EE application?
</blockquote>
<%=getOption(answers,"q15","1","XML")%>
<%=getOption(answers,"q15","2","CSV")%>
<%=getOption(answers,"q15","3","PNG")%>
<%=getOption(answers,"q15","4","JSP")%>
<hr>

<h4>Question 16</h4>
<%=getIncorrectMessage(solutions,answers,"q16")%><%=getSuccessMessage(solutions,answers,"q16")%>
<blockquote>
Which of the following best prevents path traversal?
</blockquote>
<%=getOption(answers,"q16","1","Input whitelisting")%>
<%=getOption(answers,"q16","2","Sanitizing ../ from the user input.")%>
<%=getOption(answers,"q16","3","Indirect object references.")%>
<%=getOption(answers,"q16","4","Hardening linux file permissions.")%>
<hr>

<h4>Question 17</h4>
<%=getIncorrectMessage(solutions,answers,"q17")%><%=getSuccessMessage(solutions,answers,"q17")%>
<blockquote>
Can XML files be used to "steal" data from system where the application is running?
</blockquote>
<%=getOption(answers,"q17","1","Not really, XML files are just text files. They are not executable.")%>
<%=getOption(answers,"q17","2","No but a very large XML file can crash Java and cause Availability Impact.")%>
<%=getOption(answers,"q17","3","Only if there is a buffer overflow in the XML parser.")%>
<%=getOption(answers,"q17","4","XML variables defined in the DTD can be populated with contents of files.")%>
<hr>

<h4>Question 18</h4>
<%=getIncorrectMessage(solutions,answers,"q18")%><%=getSuccessMessage(solutions,answers,"q18")%>
<blockquote>
The support team has created a maintenance bash script that they have provided to many customers. 
There are requests to productize the script so customers no longer have to SSH into the boxes. Which approach should you take?
</blockquote>
<%=getOption(answers,"q18","1","Rewrite the script in Java. The application should be self contained and should not depend on shell scripts. This may take longer but it's cleaner.")%>
<%=getOption(answers,"q18","2","Cleanup the script, then create a servlet that takes the user input then launches the script on demand and shows the output to the user.")%>
<%=getOption(answers,"q18","3","Implement input sanitization and filter out hazardous characters. Call the script but run with limited privileges. This will save time and it's safe.")%>
<%=getOption(answers,"q18","4","Implement a web shell where customers can pass in any shell command they want as root.")%>
<hr>


<h4>Question 19</h4>
<%=getIncorrectMessage(solutions,answers,"q19")%><%=getSuccessMessage(solutions,answers,"q19")%>
<blockquote>
Your application needs to run an operation with elevated privileges. Which approach should you take.
</blockquote>
<%=getOption(answers,"q19","1","Run the application as root always. This will make sure there are no issues.")%>
<%=getOption(answers,"q19","2","Ask the user to execute the operation via SSH.")%>
<%=getOption(answers,"q19","3","Use setuid flags to temporarily elevate privileges then drop them back.")%>
<%=getOption(answers,"q19","4","Add the application user to /etc/sudoers. Execute the critical functionality as a bash script that you launch with sudo.")%>
<hr>

<h4>Question 20</h4>
<%=getIncorrectMessage(solutions,answers,"q20")%><%=getSuccessMessage(solutions,answers,"q20")%>
<blockquote>
You have to implement a feature that allows users to download server logs. What is the best way to implement it?
</blockquote>
<%=getOption(answers,"q20","1","Change the permissions on a WebContent directory to allow tomcat to write to it. Configure the service to use that as a log directory.")%>
<%=getOption(answers,"q20","2","Create a servlet that gets the files and sends them on the response, based on a file id. Check that the user is admin.")%>
<%=getOption(answers,"q20","3","Create a symlink from the WebContent directory to the tomcat logs directory.")%>
<hr>

<h4>Question 21</h4>
<%=getIncorrectMessage(solutions,answers,"q21")%><%=getSuccessMessage(solutions,answers,"q21")%>
<blockquote>
Which of the statements below protects from SQL Injection?
</blockquote>
<%=getOption(answers,"q21","1","<pre>query=\"SELECT * FROM users WHERE ou='\"+request.getParameter(\"ou\")+\"' ORDER BY name \"+request.getParameter(\"sort\")</pre>")%>
<%=getOption(answers,"q21","2","<pre>query=\"SELECT * FROM users WHERE ou='?' ORDER BY name ?\"</pre>")%>
<%=getOption(answers,"q21","3","<pre>query=\"SELECT * FROM users WHERE ou='\"\n+request.getParameter(\"ou\").replace(\"\\\"\",\"\")+\"' ORDER BY name \"\n+request.getParameter(\"sort\").replace(\"\\\"\",\"\")</pre>")%>
<%=getOption(answers,"q21","4","<pre>query=\"SELECT * FROM users WHERE ou='%s' ORDER BY name %s\"</pre>")%>
<hr>


<h4>Question 22</h4>
<%=getIncorrectMessage(solutions,answers,"q22")%><%=getSuccessMessage(solutions,answers,"q22")%>
<blockquote>
Which of the following functions is considered safer?
</blockquote>
<%=getOption(answers,"q22","1","scanf")%>
<%=getOption(answers,"q22","2","gets")%>
<%=getOption(answers,"q22","3","strcmp")%>
<%=getOption(answers,"q22","4","snprintf")%>
<hr>


<h4>Question 23</h4>
<%=getIncorrectMessage(solutions,answers,"q23")%><%=getSuccessMessage(solutions,answers,"q23")%>
<blockquote>
Which of the following snippets is a format string injection vulnerability?
</blockquote>
<%=getOption(answers,"q23","1","<pre>gets(a); printf(\"Value %s is invalid!\",a);</pre>")%>
<%=getOption(answers,"q23","2","<pre>Runtime.getRuntime().exec(\"%s\",a);</pre>")%>
<%=getOption(answers,"q23","3","<pre>gets(a); printf(\"Value is invalid:\"); printf(a);</pre>")%>
<%=getOption(answers,"q23","4","<pre>query=String.format(\"SELECT * FROM users WHERE id='%s'\",a)")%>
<hr>

<h4>Question 24</h4>
<%=getIncorrectMessage(solutions,answers,"q24")%><%=getSuccessMessage(solutions,answers,"q24")%>
<blockquote>
How can you best protect against buffer overflow?
</blockquote>
<%=getOption(answers,"q24","1","Allocate large buffers.")%>
<%=getOption(answers,"q24","2","Limit the size of the input.")%>
<%=getOption(answers,"q24","3","Ensure the size of the input matches the size of the buffer.")%>
<%=getOption(answers,"q24","4","Use safe compiler flags.")%>
<hr>

<h4>Question 25</h4>
<%=getIncorrectMessage(solutions,answers,"q25")%><%=getSuccessMessage(solutions,answers,"q25")%>
<blockquote>
What type of SANS 25 vulnerability was Heartbleed?
</blockquote>
<%=getOption(answers,"q25","1","Reliance on Untrusted Inputs in a Security Decision")%>
<%=getOption(answers,"q25","2","Format string injection.")%>
<%=getOption(answers,"q25","3","Memory leakage")%>
<%=getOption(answers,"q25","4","Incorrect calculation of buffer size")%>
<hr>

<input type="submit" id="submit" class="btn" value="Submit">
</form>
</div>
</body>
</html>


