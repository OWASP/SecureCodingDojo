The vulnerable image also contains a unkown vulnerability specific to the web application running on the second port.
Configure your IPS policy include generic attacks suchs as the OWASP Top 10

Identify the IPS rules that prevent the following:

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

#### Instructions for Completing the Challenge
- Open the FW ports to allow access to the second vulnerable endpoint
- Access the tester app at the provided address
- Input your host and the challenge salt and run test
- Verify that the security software has blocked the attack and find the challenge code in the IPS events