package inc.insecure;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

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
	    final String partHeader = part.getHeader("content-disposition");
	    for (String content : part.getHeader("content-disposition").split(";")) {
	        if (content.trim().startsWith("filename")) {
	            return content.substring(
	                    content.indexOf('=') + 1).trim().replace("\"", "");
	        }
	    }
	    return null;
	}

}
