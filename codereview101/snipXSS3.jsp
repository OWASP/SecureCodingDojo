
<script>
    <%
        String searchTxt = StringEscapeUtils.escapeHtml4(request.getParameter("search")).replace("'","&#39;");
    %>

    document.cookie = 'search=<%=searchTxt%>';
</script>
