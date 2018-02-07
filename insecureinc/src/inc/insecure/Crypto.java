package inc.insecure;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * Handles Crypto functions
 */
public class Crypto {
	private static final String HASH_ALG="SHA-256";
	private static SecretKeySpec key = null;
	private static IvParameterSpec iv = null;
	
	private static Crypto instance = null;
	private static Object lock = new Object();
	
	/**
	 * Gets the current instance of the code loader
	 * @return
	 * @throws UnsupportedEncodingException 
	 * @throws NoSuchAlgorithmException 
	 * @throws IOException
	 */
	public static Crypto getInstance() throws UnsupportedEncodingException, NoSuchAlgorithmException{
		synchronized(lock){
			if(instance==null){
				instance = new Crypto();
			}
			return instance;
		}
	}
	
	
	
	/**
	 * Private singleton constructor
	 * @throws UnsupportedEncodingException
	 * @throws NoSuchAlgorithmException 
	 */
	private Crypto() throws UnsupportedEncodingException, NoSuchAlgorithmException{
		try{
			String keyString = System.getenv("CHALLENGE_KEY");
			String ivString = System.getenv("CHALLENGE_KEY_IV");
			if(keyString==null||ivString==null){
				//try to get the key pairs with System.getProperty
				keyString = System.getProperty("CHALLENGE_KEY");
				ivString = System.getProperty("CHALLENGE_KEY_IV");
			}
			//if we can't get the keys
			if(keyString==null||ivString==null){
				System.out.println("Could not initialize keys. Make sure CHALLENGE_KEY and CHALLENGE_KEY_IV are set in /opt/tomcat/bin/setenv.sh");
				return;
			}
			
			
			byte [] ivBytes = new byte[16];
			byte [] ivStringBytes = getHash(ivString,HASH_ALG);
			for(int i=0;i<ivBytes.length && i<ivStringBytes.length; i++){
				ivBytes[i] = ivStringBytes[i];
			}
			
			byte[] keyHash = getHash(keyString, HASH_ALG);
			
			key = new SecretKeySpec(keyHash, "AES");
			iv = new IvParameterSpec(ivBytes);
		}
		catch(Exception ex){
			System.out.println("Could not initialize keys."+ex.getMessage());
		}
	}


	/**
	 * Gets sha 256 bytes
	 * @param keyString
	 * @param hashAlg
	 * @return
	 * @throws NoSuchAlgorithmException
	 * @throws UnsupportedEncodingException
	 */
	public byte[] getHash(String keyString, String hashAlg) throws NoSuchAlgorithmException, UnsupportedEncodingException {
		MessageDigest md = MessageDigest.getInstance(hashAlg);

		md.update(keyString.getBytes("UTF-8")); 
		byte[] keyHash = md.digest();
		return keyHash;
	}
	
	/**
	 * Encrypts a string
	 * @param value
	 * @return
	 */
	public String encrypt(String value) {
        try {

        	if(key==null) return value;
        	
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            cipher.init(Cipher.ENCRYPT_MODE, key, iv);

            byte[] encrypted = cipher.doFinal(value.getBytes());
            
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return null;
    }

	/**
	 * Decrypts a string from base64 encoded bytes
	 * @param encrypted
	 * @return
	 * @throws NoSuchAlgorithmException 
	 * @throws UnsupportedEncodingException 
	 */
    public String decrypt( String encrypted) throws UnsupportedEncodingException, NoSuchAlgorithmException {
        try {
        
        	if(key==null) return encrypted;
        	
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5PADDING");
            cipher.init(Cipher.DECRYPT_MODE, key, iv);

            byte[] original = cipher.doFinal(Base64.getDecoder().decode(encrypted));

            return new String(original);
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        return null;
    }
    
    /**
     * Gets a SHA256 digest for the provided string
     * @param text
     * @return
     * @throws NoSuchAlgorithmException
     * @throws UnsupportedEncodingException
     */
    public String getHashString(String text) throws NoSuchAlgorithmException, UnsupportedEncodingException{
    	byte[] digest = getHash(text, HASH_ALG);
		return Base64.getEncoder().encodeToString(digest);    
	}
}
