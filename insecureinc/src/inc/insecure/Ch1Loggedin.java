package inc.insecure;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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
		
		String code = "";
		try {
			code = CodeLoader.getInstance().getCode("cwe306");
		} catch (NoSuchAlgorithmException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		session.setAttribute(Constants.CHALLENGE_CODE,code);
		response.sendRedirect(Constants.SECRET_PAGE);
		
	}

}
