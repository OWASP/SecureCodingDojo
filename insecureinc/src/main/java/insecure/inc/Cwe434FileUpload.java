/**
 * Copyright 2017-2018 Trend Micro Incorporated
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at
 * https://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
package insecure.inc;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Part;

/**
 * Servlet implementation class Cwe434FileUpload
 */
@WebServlet("/Cwe434FileUpload")
@MultipartConfig
public class Cwe434FileUpload extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Cwe434FileUpload() {
        super();
        // TODO Auto-generated constructor stub
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	
    	response.setContentType("image/svg+xml");
    	String avatarData = (String)request.getSession().getAttribute("cwe434avatarData");
    	response.getWriter().print(avatarData);
    	
    }
    
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String displayName = request.getParameter("displayName");
		
		Part avatarPart = request.getPart("avatar");
		String fileName = getFileName(avatarPart);
		if(!fileName.equals("") && fileName.indexOf(".svg") == -1){
			 response.getWriter().println("Invalid file type. Maybe you need to add more extensions ;)");
			 return;
		}
		
		if(fileName.toLowerCase().endsWith(".jsp")){
			HttpSession session = request.getSession();

			session.setAttribute(Constants.CHALLENGE_ID,"cwe434");
			response.sendRedirect(Constants.SECRET_PAGE);
			
		}
		else{
			if(fileName.equals("")) fileName="avatar.png";
			fileName="public/"+fileName;
			request.getSession().setAttribute("cwe434avatar", fileName);
			request.getSession().setAttribute("cwe434displayName",displayName);
			String avatarData ="";
			try{
				if(avatarPart!=null)  avatarData = Util.getStringFromInputStream(avatarPart.getInputStream());
				request.getSession().setAttribute("cwe434avatarData",avatarData);
			}
			catch(Exception ex){
				response.getWriter().println(ex.getMessage());
			}
			response.sendRedirect("cwe434loggedin.jsp");
	
		}

	}
	
	private String getFileName(final Part part) {
	    for (String content : part.getHeader("content-disposition").split(";")) {
	        if (content.trim().startsWith("filename")) {
	            return content.substring(
	                    content.indexOf('=') + 1).trim().replace("\"", "");
	        }
	    }
	    return "";
	}


}
