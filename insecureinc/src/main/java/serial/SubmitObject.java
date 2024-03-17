/**
 * Copyright 2017-2018 Trend Micro Incorporated
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at
 * https://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
package serial;


import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.apache.tomcat.util.codec.binary.Base64;

import insecure.inc.Util;

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
			
			if(session==null || session.getAttribute("cwe502loggedin")==null || (boolean)session.getAttribute("cwe502loggedin")==false){
				response.sendRedirect("cwe502admin.jsp");
				return;
			}
			
			output = Util.exec("/bin/ls","/tmp");
			
			
			if(filename==null || filename.trim().length()==0 || output.indexOf(filename)>-1){
				response.getWriter().write("Invalid filename: null, empty or already a file in 'tmp'");
				return;//stop here
			}
			if(filename.indexOf('/') != -1){
				response.getWriter().write("Invalid filename.  Filename must not include directories.  Just specify the name of your file.  (Example: 'foo' is ok; '/foo' or '/tmp/foo' is not ok)");
				return;
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
						response.getWriter().write("Gadget command validation failed. Only commands like 'touch /tmp/YOUR_FILE_NAME' are allowed.");
						return;//stop here
					}
				}
				ByteArrayInputStream in = new ByteArrayInputStream(objBytes);
			    ObjectInputStream is = new ObjectInputStream(in);
				Object cat = is.readObject(); //this should execute the file creation
				
				output = Util.exec("/bin/ls","/tmp");
				if(output.indexOf(filename)>-1){ //it worked
					session.setAttribute("cwe502challengepassed", true);
				}

					
				session.setAttribute("cwe502object", cat);
				response.sendRedirect("cwe502admin.jsp");

			}
		} catch (Exception e1) {
			// TODO Auto-generated catch block
			response.getWriter().write(e1.getMessage()); 
		}
		
		
	}

}
