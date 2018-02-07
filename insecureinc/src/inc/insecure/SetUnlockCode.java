package inc.insecure;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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
