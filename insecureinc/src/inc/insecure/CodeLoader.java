package inc.insecure;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.security.NoSuchAlgorithmException;
import java.util.Properties;
/**
 * Loads challenge codes
 */
public class CodeLoader {
	
	private static Properties properties = null;
	private static CodeLoader instance = null;
	private static Object lock = new Object();
	private InputStream input;
	
	/**
	 * Gets the current instance of the code loader
	 * @return
	 * @throws IOException
	 */
	public static CodeLoader getInstance() throws IOException{
		synchronized(lock){
			if(instance==null){
				instance = new CodeLoader();
			}
			return instance;
		}
	}
	
	/**
	 * Private singleton ctor
	 * @throws IOException
	 */
	private CodeLoader() throws IOException{
		ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
		input = classLoader.getResourceAsStream("inc/insecure/codes.properties");
		if(input!=null){
			properties = new Properties();
			properties.load(input);
			input.close();
		}
	}
	
	/**
	 * Gets a code for the specified challenge
	 * @param challengeName
	 * @return
	 * @throws NoSuchAlgorithmException 
	 * @throws UnsupportedEncodingException 
	 */
	public String getCode(String challengeName) throws UnsupportedEncodingException, NoSuchAlgorithmException{
		String code = "";

		if(properties.containsKey(challengeName)){
			code = properties.getProperty(challengeName);
			//decrypt the code
			code = Crypto.getInstance().decrypt(code);
		}
		
		return code;
	}
}
