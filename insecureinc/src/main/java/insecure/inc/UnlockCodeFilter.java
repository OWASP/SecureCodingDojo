/**
 * Copyright 2017-2018 Trend Micro Incorporated
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at
 * https://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
package insecure.inc;

import java.io.IOException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * Servlet Filter implementation class UnlockCode
 */
@WebFilter(urlPatterns={ "/*" })
public class UnlockCodeFilter implements Filter {

	String unlockCode = null;
	
    /**
     * Default constructor. 
     */
    public UnlockCodeFilter() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see Filter#destroy()
	 */
	public void destroy() {
		// TODO Auto-generated method stub
	}

	/**
	 * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
	 */
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		// TODO Auto-generated method stub
		// place your code here
		if(unlockCode!=null){
			HttpServletRequest hsr = (HttpServletRequest) request;
			if(hsr!=null){

				String path = hsr.getRequestURI();
				path = path.replaceAll(hsr.getContextPath(), "");

				//for all paths except unlock redirect
				if(!path.startsWith("/unlock.jsp") && !path.startsWith("/SetUnlockCode") && !path.startsWith("/public")  && !path.equals("/favicon.ico")){
					HttpSession session = hsr.getSession();
					String userUnlockCode = (String) session.getAttribute(Constants.USER_UNLOCK_CODE);
					if(unlockCode != userUnlockCode){
						session.setAttribute(Constants.UNLOCK_REDIRECT, path);
						HttpServletResponse hsResp = (HttpServletResponse) response;
						if(hsResp!=null){
							hsResp.sendRedirect("unlock.jsp");
							return;
						}
					}
				}
			}
		}
		// pass the request along the filter chain
		
		chain.doFilter(request, response);
	}

	/**
	 * @see Filter#init(FilterConfig)
	 */
	public void init(FilterConfig fConfig) throws ServletException {
		// TODO Auto-generated method stub
		unlockCode = Util.getUnlockCode();
	}

}
