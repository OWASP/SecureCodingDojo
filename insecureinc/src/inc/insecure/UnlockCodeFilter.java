package inc.insecure;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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
