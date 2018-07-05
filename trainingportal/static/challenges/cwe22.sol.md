### Solution for "Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')" challenge

This challenge showcase a vulnerability with improper file path input without limitation.

To pass the challenge simply, you need to forgy the URL **file** parameter `/cwe22.jsp?file=privacy.html` by following steps:

* try access file `WEB-INF/web.xml` to get more information.
* try using `../` to explore different tier of file folder.