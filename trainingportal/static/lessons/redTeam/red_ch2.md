In this challenge, you will scan the last available open port that `nmap` found to check for vulnerabilities.  There are a number of [Vulnerability Scanning Tools](https://owasp.org/www-community/Vulnerability_Scanning_Tools) that can be used for this. 

Your security tests should include the following attack types based on OWASP top 10:

1. Injection
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting
8. Insecure Deserialization
9. Excluded, was part of first challenge - Using Components with Known Vulnerabilities
10. Excluded, not an attack - Insufficient Logging & Monitoring

The following example is using the [OWASP Zed Attack Proxy](https://owasp.org/www-project-zap/) (ZAP). 

1.  Install ZAP.  A number of native [installers](https://www.zaproxy.org/download/) are offered, as well as a [docker image](https://www.zaproxy.org/docs/docker/) that allows accessing the UI through your [browser](https://www.zaproxy.org/docs/docker/webswing/) (watch for port conflict on port 8080).
2.  Launch ZAP.
3.  Go to Quick Start and specify the URL of the application (it will be on port 8888, so the URL will be `http://your-ip-here:8888/`)
4.  The Spider should find the `ping.php` app.  An active scan then kicks off.
5.  Once the active scan completes, check the Alerts tab -- you will find a High vulnerability.

The `redblueapp` container has an application that will generate a challenge code.  Can you find it, and run it to generate the code?