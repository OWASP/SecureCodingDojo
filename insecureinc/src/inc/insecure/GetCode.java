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
@WebServlet("/GetCode")
public class GetCode extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetCode() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
		HttpSession session = request.getSession();
		String code = (String) session.getAttribute(Constants.CHALLENGE_CODE);
		String salt = request.getParameter("salt").trim();
		String saltedCode = "";
		if(salt!=null && code!=null){
			try {
				saltedCode = Crypto.getInstance().getHashString(code+salt);
			} catch (NoSuchAlgorithmException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}	
		}
		response.getWriter().print(saltedCode);
	}

}
