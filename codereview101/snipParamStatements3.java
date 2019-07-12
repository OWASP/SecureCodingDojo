
String query = String.format("SELECT * FROM users WHERE usr='%s' AND pwd='%s'", usr, pwd);
Connection conn = db.getConn();
Statement stmt = conn.createStatement();


ResultSet rs = stmt.executeQuery(query);
