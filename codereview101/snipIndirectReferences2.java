
String fileId = request.getParameter("fileId");
file = "public/"+availableFiles[fileId];
InputStream input = null;
BufferedReader reader = null;
StringBuilder sb = new StringBuilder();
input = getServletContext().getResourceAsStream(file);
