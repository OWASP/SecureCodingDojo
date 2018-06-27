package serial;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectOutputStream;
import java.io.StringWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.apache.commons.io.IOUtils;
import org.apache.tomcat.util.codec.binary.Base64;

/**
 * Servlet implementation class GetCommand
 */
@WebServlet("/GetCommand")
@MultipartConfig
public class GetCommand extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetCommand() {
        super();
        // TODO Auto-generated constructor stub
    }

    
    private String getMultiPartValue(HttpServletRequest request, String paramName) throws IllegalStateException, IOException, ServletException{
    	String param = request.getParameter(paramName);
		Part object = request.getPart(paramName);
		InputStream objIs = object.getInputStream();
		StringWriter writer = new StringWriter();
		IOUtils.copy(objIs, writer);
		String value = writer.toString();
		return value;
    }
    
    
	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String authCode = getMultiPartValue(request, "authCode");
		String typeString = getMultiPartValue(request, "type");
		String target = getMultiPartValue(request, "target");
		String argument = getMultiPartValue(request, "argument");
		CommandType type = CommandType.NONE;
		switch(typeString.toUpperCase()){
			case "STOP":type = CommandType.STOP; break;
			case "EXEC":type = CommandType.EXEC; break;
			case "UPLOAD":type = CommandType.UPLOAD; break;
		}
		if(authCode!=null && type!=CommandType.NONE){
			Object obj = new Object();
			try {
				Command c = new Command();
				c.setType(type);
				c.setAuthCode(Base64.decodeBase64(authCode));
				c.setTarget(target);
				c.setArgument(argument);
				obj = c;
			} catch (Exception e) {
				e.printStackTrace();
			}
			
			ByteArrayOutputStream out = new ByteArrayOutputStream();
		    ObjectOutputStream os = new ObjectOutputStream(out);
		    
		    os.writeObject(obj);
		    String b64String = Base64.encodeBase64String(out.toByteArray());
		    response.getWriter().println(b64String);
		}
	}

}
