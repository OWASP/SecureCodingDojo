
<script>
    <%
        String searchTxt = StringEscapeUtils.escapeHtml4(request.getParameter("search"));
    %>

    document.cookie = 'search=<%=searchTxt%>';
</script>
