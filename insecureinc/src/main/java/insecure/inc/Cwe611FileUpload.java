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
import jakarta.servlet.http.Part;

/**
 * Servlet implementation class Cwe611FileUpload
 */
@WebServlet("/Cwe611FileUpload")
@MultipartConfig
public class Cwe611FileUpload extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Cwe611FileUpload() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String displayName = request.getParameter("displayName");
		
		Part avatarPart = request.getPart("avatar");
		final String fileName = getFileName(avatarPart);
		if(fileName==null || !fileName.toLowerCase().endsWith(".svg")){
			 response.getWriter().println("Invalid file type");
			 return;
		}
		
		String avatar = "";
		if(avatarPart!=null)  avatar = Util.getStringFromInputStream(avatarPart.getInputStream());
		
		if(avatar.equals("")) avatar="<img src=\"public/avatar.png\" class=\"media-object\" style=\"width:60px\" id=\"avatarImg\">";
		request.getSession().setAttribute("cwe611avatar",avatar);
		request.getSession().setAttribute("cwe611displayName",displayName);
		response.sendRedirect("cwe611loggedin.jsp");
	}
	
	private String getFileName(final Part part) {
	    for (String content : part.getHeader("content-disposition").split(";")) {
	        if (content.trim().startsWith("filename")) {
	            return content.substring(
	                    content.indexOf('=') + 1).trim().replace("\"", "");
	        }
	    }
	    return null;
	}

}
