package serial;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.servlet.http.Part;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.xml.sax.InputSource;

/**
 * Servlet implementation class LoginDocument
 */
@WebServlet("/LoginDocument")
@MultipartConfig
public class LoginDocument extends HttpServlet {
	private static final long serialVersionUID = 1L;
    
	public static String xmlToString(Document doc) {
	    try {
	        StringWriter sw = new StringWriter();
	        TransformerFactory tf = TransformerFactory.newInstance();
	        Transformer transformer = tf.newTransformer();
	        transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "no");
	        transformer.setOutputProperty(OutputKeys.METHOD, "xml");
	        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
	        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

	        transformer.transform(new DOMSource(doc), new StreamResult(sw));
	        return sw.toString();
	    } catch (Exception ex) {
	        throw new RuntimeException("Error converting to String", ex);
	    }
	}
	
	public static String covertXmlDocumentToString(Document doc) throws TransformerException {

		TransformerFactory tFactory = TransformerFactory.newInstance();
		Transformer transformer = tFactory.newTransformer();

		DOMSource source = new DOMSource(doc);
		StringWriter writer = new StringWriter();
		StreamResult result = new StreamResult(writer);
		transformer.transform(source, result);
		String xmlString = writer.toString();

		return xmlString;
	}
	
	
    /**
     * @see HttpServlet#HttpServlet()
     */
    public LoginDocument() {
        super();
        // TODO Auto-generated constructor stub
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
		
		DocumentBuilder builder;
		Document doc;
		try {
			DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
			builder = factory.newDocumentBuilder();		
			Part document = request.getPart("document");
			doc = builder.parse(new InputSource(document.getInputStream()));
			doc.getDocumentElement().normalize();
			boolean loggedin = false;
			if(doc.getElementsByTagName("user").getLength() == 1 && doc.getElementsByTagName("password").getLength() == 1){
			
				String givenUser = doc.getElementsByTagName("user").item(0).getTextContent();
				String givenPassword = doc.getElementsByTagName("password").item(0).getTextContent();
				
				Properties credentials = new Properties();
				credentials.load(new FileInputStream(new File("/etc/credentials.properties")));
				String user = credentials.getProperty("user");
				String pass = credentials.getProperty("password");
				if(givenUser.equals(user) && givenPassword.equals(pass)){
					HttpSession session = request.getSession();
					if(session!=null){
						loggedin=true;
						session.setAttribute("loggedin", loggedin);
						response.sendRedirect("index.jsp");
					}
				}
			}
			
			if(!loggedin){
				String xmlString = xmlToString(doc);
				response.getWriter().write(String.format("Invalid authentication document provided or credentials do not match /etc/credentials.properties! Document: '%s'", xmlString));
			}
			
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			response.getWriter().write(e.getMessage());
		}
		
		
	}

}
