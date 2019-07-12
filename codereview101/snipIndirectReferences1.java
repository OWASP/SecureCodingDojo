
String file = request.getParameter("file");
file = "public/"+file;
InputStream input = null;
BufferedReader reader = null;
StringBuilder sb = new StringBuilder();
input = getServletContext().getResourceAsStream(file);
