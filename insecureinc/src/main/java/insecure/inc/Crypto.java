/**
 * Copyright 2017-2018 Trend Micro Incorporated
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at
 * https://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
package insecure.inc;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * Handles Crypto functions
 */
public class Crypto {
	private static final String HASH_ALG="SHA-256";
	private static String masterSalt = "";
	
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
			
			String masterSaltVar = System.getenv("CHALLENGE_MASTER_SALT");
			if(masterSaltVar == null){
				masterSaltVar = System.getProperty("CHALLENGE_MASTER_SALT");
			}
			
			if(masterSaltVar != null){
				masterSalt = masterSaltVar;
			}
			else{
				System.out.println("WARNING.CHALLENGE_MASTER_SALT not set. Challenges may be bypassed.");
			}
		
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
     * Gets a SHA256 digest for the provided string
     * @param text
     * @return
     * @throws NoSuchAlgorithmException
     * @throws UnsupportedEncodingException
     */
    public String getCodeHashString(String text) throws NoSuchAlgorithmException, UnsupportedEncodingException{
    	byte[] digest = getHash(text+masterSalt, HASH_ALG);
		return Base64.getEncoder().encodeToString(digest);    
	}
}
