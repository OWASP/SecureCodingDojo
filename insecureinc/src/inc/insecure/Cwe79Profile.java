package inc.insecure;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class Cwe79Profile
 */
@WebServlet("/Cwe79Profile")
public class Cwe79Profile extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Cwe79Profile() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String displayName = (String)request.getSession().getAttribute("cwe79displayName");
		if(displayName==null) displayName="";
		
		String avatar = (String)request.getSession().getAttribute("cwe79avatar");
		if(avatar==null || avatar=="") avatar="public/avatar.png";
		
		response.getWriter().print(String.format("%s,%s", displayName,avatar));
	}
}

