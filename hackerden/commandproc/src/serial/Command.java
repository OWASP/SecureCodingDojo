package serial;

import java.io.Serializable;

public class Command implements Serializable 
{

	
	private CommandType type = null;
	private String target = "*";
	private String argument = "";
	
	private byte[] authCode = null;
	
	public CommandType getType() {
		return type;
	}
	public void setType(CommandType type) {
		this.type = type;
	}
	
	public String getTarget() {
		return target;
	}
	public void setTarget(String target) {
		this.target = target;
	}
	public byte[] getAuthCode() {
		return authCode;
	}
	public void setAuthCode(byte[] authCode) {
		this.authCode = authCode;
	}
	public String getArgument() {
		return argument;
	}
	public void setArgument(String argument) {
		this.argument = argument;
	}		  
	
	
	  
}
