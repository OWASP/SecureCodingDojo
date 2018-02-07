package inc.insecure;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.StringBufferInputStream;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import com.sun.xml.internal.fastinfoset.stax.events.XMLConstants;

public class Util {
	
	/**
	 * Checks the admin pass against a hard-coded hash
	 * @param pwd
	 * @return
	 * @throws UnsupportedEncodingException 
	 * @throws NoSuchAlgorithmException 
	 */
	public static boolean isAdminPassOk(String pwd) throws NoSuchAlgorithmException, UnsupportedEncodingException{
		if(pwd==null) return false;
		String passHash = Crypto.getInstance().getHashString(pwd+"PucMfDDfkG7jVOaaK51AjQ");
		return passHash.equals("6lvOg9Sb1U8XIo2pNifNw+S3+Kk82+vX0E7CcqttkYU=");
	}
	
	/**
	 * Executes a command and returns the output
	 * @param command
	 * @return
	 * @throws IOException
	 * @throws InterruptedException
	 */
	public static String exec(String ... commandArgs) throws IOException, InterruptedException{
		Process p = Runtime.getRuntime().exec(commandArgs);
	    p.waitFor();
	    StringBuilder sb = new StringBuilder();
	    BufferedReader reader = null;
	    if(p.exitValue() == 0){
		    reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
	    }
	    else{
	    	reader = new BufferedReader(new InputStreamReader(p.getErrorStream()));
	    }
	   
	    String line = String.format("Executing command:");
	    for(String s : commandArgs){
	    	line+=s+" ";
	    }
	    sb.append(line+"\n");
	    while ((line = reader.readLine())!= null) {
	    	sb.append(line + "\n");
	    }
   
		return sb.toString();

	}
	
	public static String bytesToHex(byte[] in) {
	    final StringBuilder builder = new StringBuilder();
	    for(byte b : in) {
	        builder.append(String.format("%02x", b));
	    }
	    return builder.toString();
	}
	
	
	public static boolean hasScriptTagOrEvent(String value){
		if(value==null || value.equals("")) return false;
		//extract the image tag
		Pattern p = Pattern.compile("(?i)(<script|['\"]\\son\\w+|\";\\w+\\()");
		Matcher m = p.matcher(value);
		if(m.find()){
			return true;				
		}
		return false;
	}

	public static boolean isMatch(String value, String pattern){
		if(value==null || value.equals("")) return false;
		Pattern p = Pattern.compile(pattern);
		Matcher m = p.matcher(value);
		if(m.find()){
			return true;				
		}
		return false;
	}
	
	
	public static boolean hasImgTag(String value){
		if(value==null || value.equals("")) return false;
		//extract the image tag
		Pattern p = Pattern.compile("(?i)<img");
		Matcher m = p.matcher(value);
		if(m.find()){
			return true;				
		}
		return false;
	}
	
	public static boolean hasImgTagAndEvent(String value){
		if(value==null || value.equals("")) return false;
		//extract the image tag
		Pattern p = Pattern.compile("(?i)<img\\s*[^>]*on(error|load)\\s*=\\s*['\"]?\\s*(alert|prompt)");
		Matcher m = p.matcher(value);
		if(m.find()){
			return true;				
		}
		return false;
	}
	
	public static boolean hasXSS(String value){
		boolean result=false;
		if(value==null || value.equals("")) return false;
		//extract the image tag
		Pattern p = Pattern.compile("(?i)<img\\s*[^>]*on(error|load)\\s*=\\s*['\"]?\\s*(alert|prompt)\\(['\"]FIRE!['\"]\\)[^>]*>");
		Matcher m = p.matcher(value);
		if(m.find()){
			String imgTag = m.group(0);
			
			//should have a source
			p = Pattern.compile("(?i)\\s+src\\s*=\\s*([^>\\s]+)[\\s>/]+");
			m = p.matcher(imgTag);
			if(m.find()){
				return true;		
			}
			
		}
		return result;
	}
	
	public static boolean hasCSRF(String value){
		boolean result=false;
		if(value==null || value.equals("")) return false;
		//extract the image tag
		Pattern p = Pattern.compile("(?i)(https?://[^/]+/)?cwe352loggedin.jsp\\?displayName=Banjo");
		Matcher m = p.matcher(value);
		if(m.find()){
			return true;
		}
		p = Pattern.compile("(?i)(https?://[^/]+/)?cwe352loggedin.jsp\\?.*&displayName=Banjo");
		m = p.matcher(value);
		if(m.find()){
			return true;
		}
		
		return result;
	}
	
	
	public static boolean isExternalProtocol(String value){
		boolean result=false;
		if(value==null || value.equals("")) return false;
		//extract the image tag
		Pattern p = Pattern.compile("(?i)system\\s*[\"']?(http|ftp|jar)");
		Matcher m = p.matcher(value);
		if(m.find()){
			return true;
		}
				
		return result;
	}
	
	
	public static boolean isValidServerName(String value){
		boolean result=false;
		if(value==null || value.equals("")) return false;
		//extract the image tag
		Pattern p = Pattern.compile("^[\\w\\.]+(\\s*;\\s*(cat|less)\\s*\\/etc\\/passwd)?$");
		Matcher m = p.matcher(value);
		if(m.find()){
			return true;
		}
				
		return result;
	}
	
	public static String getUnlockCode(){
		String unlockCode = System.getenv("UNLOCK_CODE");
		
		if(unlockCode==null){
			//try to get the key pairs with System.getProperty
			unlockCode = System.getProperty("UNLOCK_CODE");
		}
		return unlockCode;
	}
	
	public static String executeMasterPwd(String userPwd,String sourceFile) throws IOException, InterruptedException{
		StringBuilder consoleOutput = new StringBuilder();
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
		InputStream is = classLoader.getResourceAsStream(sourceFile);
		OutputStream os = null;
		Random r = new Random();
		int val = r.nextInt(1000000);
		String tmpFileName = "/tmp/"+val;
	    try {
	       
	        os = new FileOutputStream(tmpFileName+".c");
	        byte[] buffer = new byte[1024];
	        int length;
	        while ((length = is.read(buffer)) > 0) {
	            os.write(buffer, 0, length);
	        }
	    
	    } finally {
	        if(is!=null) is.close();
	        if(os!=null) os.close();
	    }
	    String [] cmdArgs = {"/usr/bin/gcc","-fno-stack-protector",tmpFileName+".c","-o",tmpFileName+".exe"};
	    String out = exec(cmdArgs);
	    consoleOutput.append(out);
	    String cmd = String.format("%s.exe",tmpFileName);
	    Process p = Runtime.getRuntime().exec(cmd);

	    OutputStream stdIn = p.getOutputStream();
	    BufferedReader reader = null;
	    reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
	    
	    stdIn.write(userPwd.getBytes());
	    stdIn.flush();
	    stdIn.close();
	    p.waitFor();
	    StringBuilder sb = new StringBuilder();
	    
	    if(p.exitValue() == 0){
		   reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
	    } 	
	    else{
	    	reader = new BufferedReader(new InputStreamReader(p.getErrorStream()));
	    }
	    
	    String line = String.format("Executing command: %s",cmd);
	    consoleOutput.append(line + "\n");
	    while ((line = reader.readLine())!= null) {
	    	consoleOutput.append(line + "\n");
	    }
	    
	    File f = new File(tmpFileName+".c");
	    f.delete();
	    f= new File(tmpFileName+".exe");
	    f.delete();
	    return consoleOutput.toString();
	
		
	}
	

	public static boolean isAlphanum(String val, char ... exceptions){
        boolean result = true;
        int count = val.length();
        for(int i=0;i<count;i++){
        	char c = val.charAt(i);
        	boolean isOk = false;
        	//if it's alphabetic turns true
        	isOk = isOk | Character.isAlphabetic(c);
        	//if it's a digit turns true
        	isOk = isOk | Character.isDigit(c);
        	//if it's in the list of exception turns true
        	for(char ex : exceptions){
        		isOk = isOk | ex==c;
        	}
        	
        	if(isOk == false){ //if the character didn't meet the requirements return false
        		return false;
        	}
        }
        return result;
    }
	
	
	public static String xmlToString(Document doc) {
	    try {
	        StringWriter sw = new StringWriter();
	        TransformerFactory tf = TransformerFactory.newInstance();
	        Transformer transformer = tf.newTransformer();
	        transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
	        transformer.setOutputProperty(OutputKeys.METHOD, "xml");
	        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
	        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");

	        transformer.transform(new DOMSource(doc), new StreamResult(sw));
	        return sw.toString();
	    } catch (Exception ex) {
	        throw new RuntimeException("Error converting to String", ex);
	    }
	}
	
	public static Document parseXML(String xml) throws SAXException, IOException, ParserConfigurationException {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		
		DocumentBuilder builder = factory.newDocumentBuilder();
		
		Document doc = builder.parse(new StringBufferInputStream(xml));
		doc.getDocumentElement().normalize();
		
		return doc;
	}
	
	public static String getStringFromInputStream(InputStream input) throws IOException{
		String contents = "";
		BufferedReader reader = null;
		StringBuilder sb = new StringBuilder();
		try {
			
			
			reader = new BufferedReader(new InputStreamReader(input,"UTF-8"));
	        String line = reader.readLine();

	        while (line != null) {
	            sb.append(line);
	            sb.append("\n");
	            line = reader.readLine();
	            if(sb.length()>1024 * 10) throw new Exception("Invalid file size");
	        }
		}
	    catch(Exception ex){
	    	contents = ex.getMessage();
	    
	    } finally {
	        if(reader!=null) reader.close();
	    }
		contents = sb.toString();
		return contents;
	}
}
