The vulnerable image also contains a unkown vulnerability specific to the web application running on the second port.
Configure your IPS policy to block the following OWASP Top 10 attacks

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
- Open the FW ports for the image
- Access the tester app at the provided address
- Input your host and the challenge salt and run test
- Verify that the security software has blocked the attack and find the challenge code in the IPS events