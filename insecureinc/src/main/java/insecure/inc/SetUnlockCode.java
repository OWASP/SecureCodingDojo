/**
 * Copyright 2017-2018 Trend Micro Incorporated
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at
 * https://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
package insecure.inc;

import java.io.IOException;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Servlet implementation class GetCode
 */
@WebServlet("/SetUnlockCode")
public class SetUnlockCode extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SetUnlockCode() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		HttpSession session = request.getSession();
		String unlockCode = (String) Util.getUnlockCode();
		String userUnlockCode = request.getParameter("unlockCode").trim();
		
		if(unlockCode.equals(userUnlockCode)){
			session.setAttribute(Constants.USER_UNLOCK_CODE, unlockCode);
			response.getWriter().print("OK");
		}
		else{
			response.getWriter().print("Invalid unlock code.");
		}
	}
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
		HttpSession session = request.getSession();
		String redirectPath = (String)session.getAttribute(Constants.UNLOCK_REDIRECT);
		if(redirectPath!=null){
			String fullPath = request.getContextPath() + redirectPath;
			response.sendRedirect(fullPath);
		}
	}

}
