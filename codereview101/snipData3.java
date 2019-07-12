
String url = "https://my-service.cloud.biz/Login";
URL obj = new URL(url);
HTTPURLConnection con = (HTTPURLConnection) obj.openConnection();
con.setRequestMethod("POST");
con.setRequestProperty("User-Agent", USER_AGENT);
