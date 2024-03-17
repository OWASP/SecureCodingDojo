/**
 * Copyright 2017-2018 Trend Micro Incorporated
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at
 * https://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
package insecure.inc;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Servlet implementation class Ch1Loggedin
 */
@WebServlet("/Ch1Loggedin")
public class Ch1Loggedin extends HttpServlet {
	private static final long serialVersionUID = 1L;
    
	/**
	 * Verifies if the user is authenticated
	 * @param request
	 * @return
	 */
	protected boolean isAuthenticated(HttpServletRequest request){
        String authToken = (String) request.getSession().getAttribute("authToken");
        Cookie[] cookies = request.getCookies();
        boolean isAuth = false;
        if(cookies != null) {
            for (int i = 0; i < cookies.length; i++) {
                Cookie cookie=cookies[i];
                String cookieName = cookie.getName();
                String cookieValue = cookie.getValue();
                if(cookieName.equals("authToken") && cookieValue.equals(authToken)) return true;
            }
        }
        return isAuth;
    }
	
	
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Ch1Loggedin() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	@SuppressWarnings("unused")
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		
		HttpSession session = request.getSession();
		

		session.setAttribute(Constants.CHALLENGE_ID,"cwe306");
		response.sendRedirect(Constants.SECRET_PAGE);
		
	}

}
