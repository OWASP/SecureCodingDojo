package inc.insecure;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class Cwe352Profile
 */
@WebServlet("/Cwe352Profile")
public class Cwe352Profile extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Cwe352Profile() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String displayName = (String)request.getSession().getAttribute("cwe352displayName");
		if(displayName==null) displayName="";
		
		String avatar = (String)request.getSession().getAttribute("cwe352avatar");
		if(avatar==null || avatar=="") avatar="public/avatar.png";
		
		response.getWriter().print(String.format("%s,%s", displayName,avatar));
	}

}
