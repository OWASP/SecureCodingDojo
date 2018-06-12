package serial;


import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.StringWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;

import org.apache.commons.io.IOUtils;
import org.apache.tomcat.util.codec.binary.Base64;
import org.xml.sax.InputSource;

/**
 * Servlet implementation class SubmitObject
 */
@WebServlet("/SubmitCommand")
@MultipartConfig
public class SubmitCommand extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SubmitCommand() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		boolean loggedin = false;
		HttpSession session = request.getSession();
		
		if(session!=null){
			if(session.getAttribute("loggedin") != null){
				loggedin = (boolean)session.getAttribute("loggedin");
			}
		}
		if(loggedin){
			Part object = request.getPart("object");
			InputStream objIs = object.getInputStream();
			StringWriter writer = new StringWriter();
			IOUtils.copy(objIs, writer);
			String b64String = writer.toString();
			if(b64String != null && !b64String.trim().isEmpty()){
				byte [] objBytes = Base64.decodeBase64(b64String);
			
				ByteArrayInputStream in = new ByteArrayInputStream(objBytes);
			    ObjectInputStream is = new ObjectInputStream(in);
	
			    try {
					Object cat = is.readObject();
					session.setAttribute("CAT", cat);
					response.sendRedirect("index.jsp");
				} catch (ClassNotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
		else{
			response.sendRedirect("login.jsp");
		}
	}
}
