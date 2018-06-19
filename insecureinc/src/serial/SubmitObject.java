package serial;


import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Arrays;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.tomcat.util.codec.binary.Base64;

import inc.insecure.Util;

/**
 * Servlet implementation class SubmitObject
 */
@WebServlet("/SubmitObject")
public class SubmitObject extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final String CAT = "rO0ABXNyAApzZXJpYWwuQ2F0mJizcryhARMCAAFMAARuYW1ldAASTGphdmEvbGFuZy9TdHJpbmc7eHB0AApTZXJpYWwgQ2F0";
	private static final String TEXEC = "texec";
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SubmitObject() {
        super();
        // TODO Auto-generated constructor stub 
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		Object obj = new Object();
		try {
			obj = new Cat();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		ByteArrayOutputStream out = new ByteArrayOutputStream();
	    ObjectOutputStream os = new ObjectOutputStream(out);
	    
	    os.writeObject(obj);
	    String b64String = Base64.encodeBase64String(out.toByteArray());
	    response.getWriter().println(b64String);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String b64String = request.getParameter("object");
		String filename = request.getParameter("filename");
		String output = "";
		try {
			HttpSession session = request.getSession();
			
			if(session==null || session.getAttribute("cwe509loggedin")==null || (boolean)session.getAttribute("cwe509loggedin")==false){
				response.sendRedirect("cwe509admin.jsp");
				return;
			}
			
			output = Util.exec("/bin/ls","/tmp");
			
			
			if(filename==null || filename.trim().length()==0 || output.indexOf(filename)>-1){
				response.getWriter().write("Invalid filename: null, empty or already a file in 'tmp'");
				return;//stop here
			}
			
			
			
			if(b64String != null && !b64String.trim().isEmpty()){
				
				byte [] objBytes = Base64.decodeBase64(b64String);
				
				if(!b64String.equals(CAT)){ //this isn't a cat validate that only harmless commands are being executed
					
					String expected = "xpttouch /tmp/"+filename+TEXEC;
					StringBuilder sBuilder = new StringBuilder();
					for(int i=0;i<objBytes.length;i++){
						char c = (char) objBytes[i];
						if(c >=' ' && c <= 'z' ){
							sBuilder.append(c); 
						}
					}
					
					String objString = sBuilder.toString().toLowerCase();
					boolean commandFound = objString.contains(expected);
					boolean multipleTEXEC = objString.indexOf(TEXEC) != objString.lastIndexOf(TEXEC);
					boolean containsProcess = objString.indexOf("process") >-1;
					if(!commandFound || multipleTEXEC || containsProcess){
						response.getWriter().write("Invalid command in gadget");
						return;//stop here
					}
				}
				ByteArrayInputStream in = new ByteArrayInputStream(objBytes);
			    ObjectInputStream is = new ObjectInputStream(in);
				Object cat = is.readObject(); //this should execute the file creation
				
				output = Util.exec("/bin/ls","/tmp");
				if(output.indexOf(filename)>-1){ //it worked
					session.setAttribute("cwe509challengepassed", true);
				}

					
				session.setAttribute("cwe509object", cat);
				response.sendRedirect("cwe509admin.jsp");

			}
		} catch (Exception e1) {
			// TODO Auto-generated catch block
			response.getWriter().write(e1.getMessage()); 
		}
		
		
	}

}
