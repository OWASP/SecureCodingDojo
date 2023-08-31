/**
 * Copyright 2017-2018 Trend Micro Incorporated
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at
 * https://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
package insecure.inc;

import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Random;

import org.apache.derby.jdbc.EmbeddedDriver;

public class EmbeddedDB {
	
	private String dbName;
	private Connection conn = null;
	
	public void createDB() {
		  
		  PreparedStatement pstmt;
		  Statement stmt;
		  String createSQL = "create table users (usr varchar(30), pwd varchar(30))";
		  
		
		  try {
		     Driver derbyEmbeddedDriver = new EmbeddedDriver();
		     DriverManager.registerDriver(derbyEmbeddedDriver);
		     Random r = new Random();
			 int val = r.nextInt(1000000);
			 dbName = Integer.toString(val);
		     conn = DriverManager.getConnection(String.format("jdbc:derby:memory:%s;create=true",dbName), "admin", "pass123");
			 getConn().setAutoCommit(false);
			 stmt = getConn().createStatement();
			 stmt.execute(createSQL);
			
			 pstmt = getConn().prepareStatement("insert into users (usr,pwd) values(?,?)");
			 pstmt.setString(1, "admin");
			 pstmt.setString(2, "0523750734805238046027");
		     pstmt.executeUpdate();
		
		     getConn().commit();
		
		  } catch (SQLException ex) {
		     System.out.println("in connection" + ex);
		  }
	
   }
	
	public void drop(){
		 try {
	         DriverManager.getConnection
	            (String.format("jdbc:derby:memory:%s;drop=true", dbName));
	      } catch (SQLException ex) {
	           System.err.println(ex.getMessage());
	         
	      }
	}

	public Connection getConn() {
		return conn;
	}


}
