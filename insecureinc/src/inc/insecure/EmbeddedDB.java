package inc.insecure;

import java.sql.Connection;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
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
		  ResultSet rs = null;
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
