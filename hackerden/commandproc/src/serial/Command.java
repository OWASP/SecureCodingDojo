/*
Copyright 2017-2018 Trend Micro Incorporated
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at
https://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
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
