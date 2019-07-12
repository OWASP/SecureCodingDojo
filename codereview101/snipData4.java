
String url = "http://my-service.cloud.biz/Login?usr="+usr+"&pwd="+pwd;
URL obj = new URL(url);
HTTPURLConnection con = (HTTPURLConnection) obj.openConnection();
con.setRequestMethod("GET");
con.setRequestProperty("User-Agent", USER_AGENT);
