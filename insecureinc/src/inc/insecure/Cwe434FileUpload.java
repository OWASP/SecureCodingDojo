package inc.insecure;

import java.io.IOException;
import java.io.PrintWriter;
import java.security.NoSuchAlgorithmException;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

/**
 * Servlet implementation class Cwe434FileUpload
 */
@WebServlet("/Cwe434FileUpload")
@MultipartConfig
public class Cwe434FileUpload extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Cwe434FileUpload() {
        super();
        // TODO Auto-generated constructor stub
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    	
    	response.setContentType("image/svg+xml");
    	String avatarData = (String)request.getSession().getAttribute("cwe434avatarData");
    	response.getWriter().print(avatarData);
    	
    }
    
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String displayName = request.getParameter("displayName");
		
		Part avatarPart = request.getPart("avatar");
		String fileName = getFileName(avatarPart);
		if(!fileName.equals("") && fileName.indexOf(".svg") == -1){
			 response.getWriter().println("Invalid file type. Maybe you need to add more extensions ;)");
			 return;
		}
		
		if(fileName.toLowerCase().endsWith(".jsp")){
			HttpSession session = request.getSession();
			
			String code = "";
			try {
				code = CodeLoader.getInstance().getCode("cwe434");
			} catch (NoSuchAlgorithmException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			session.setAttribute(Constants.CHALLENGE_CODE,code);
			response.sendRedirect(Constants.SECRET_PAGE);
			
		}
		else{
			if(fileName.equals("")) fileName="avatar.png";
			fileName="public/"+fileName;
			request.getSession().setAttribute("cwe434avatar", fileName);
			request.getSession().setAttribute("cwe434displayName",displayName);
			String avatarData ="";
			try{
				if(avatarPart!=null)  avatarData = Util.getStringFromInputStream(avatarPart.getInputStream());
				request.getSession().setAttribute("cwe434avatarData",avatarData);
			}
			catch(Exception ex){
				response.getWriter().println(ex.getMessage());
			}
			response.sendRedirect("cwe434loggedin.jsp");
	
		}

	}
	
	private String getFileName(final Part part) {
	    final String partHeader = part.getHeader("content-disposition");
	    for (String content : part.getHeader("content-disposition").split(";")) {
	        if (content.trim().startsWith("filename")) {
	            return content.substring(
	                    content.indexOf('=') + 1).trim().replace("\"", "");
	        }
	    }
	    return "";
	}


}
