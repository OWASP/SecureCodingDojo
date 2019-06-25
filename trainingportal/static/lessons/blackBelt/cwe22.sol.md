### Solution for the "Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')" challenge

This challenge showcases a vulnerability where the application allows the attacker to fetch resources from the file system via a file path input without limitation.

To pass the challenge simply, you need to alter the URL **file** parameter in `cwe22.jsp?file=privacy.html` as follows:

* Go up one level with `../` then into the `WEB-INF` folder and access the `web.xml` file: **cwe22.jsp?file=`../WEB-INF/web.xml`**. 
    **WEB-INF/web.xml** is a standard configuration file in Java web applications.
* The `web.xml` file will include the name of the **properties file** that contains the secret password. Replace `web.xml` with the name of the **properties file**.

**NOTE**: While this demonstration involves a web application, `../` attacks are impacting desktop applications as well. 
Attackers can include `../` paths in ZIP archives or properties or configuration files in order to override sensitive resources or extract protected resources.