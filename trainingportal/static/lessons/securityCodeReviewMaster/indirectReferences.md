`Path Traversal` and `Incorrect Authorization` are vulnerabilities included in OWASP Top 10 list at #5: **Broken Access Control**.

These flaws allow attackers to access privileged resources. Path Traversal targets file system resources, while Incorrect Authorization exposes data protected through application permissions.

`Open Redirect` is another type of vulnerability which involves URL resources. This vulnerability allows attackers to leverage legitimate sites in phishing attacks. An attacker will manipulate the URL of the good site via a redirect parameter and cause a redirect to a phishing site that will deploy malware.

All these flaws are made possible by a insecure practice called: **"Direct Object Reference"**.

Here are a few examples of direct object references:

1. A document on a website will be referenced by server file path: _https://site.com/download?file=`/downloads/manual.pdf`_
2. A page used to generate and transmit a confidential report will reference the e-mail address of the recipient: _https://site.com/sendreport?email=`jsmith@corporate.com`_
3. A redirect to a single sign on service will reference the full URL of the service: _https://site.com/login?sso=`https://adfs.corporate.com`_

Following are the abuse cases for each of the examples above:

1. An attacker will manipulate the `file` argument to reveal a restricted system configuration: _https://site.com/download?file=`../../../../../../../../etc/shadow`_
2. An attacker will trick an unsuspecting victim into generating a confidential report for the wrong recipient: _https://site.com/sendreport?email=`hacker@evil.bad`_
3. An attacker will leverage the legitimate page to send unsuspecting users to a phishing site: _https://site.com/login?sso=`https://adfs.site.com.evil.bad`_

The security best practice to prevent such attacks is, as you may have guessed, using **Indirect Object References**.

For the first example, instead of using the actual file name the application can use an intermediary identifier:  _https://site.com/download?`fileID=52`_ . This way the attacker can only access the intended collection of resources for that download page. 

This best practice has additional benefits:

- Prevents transmission of potentially sensitive data in URLs. Ex. instead of userEmail=john.doe@company.com use userEmailId=52.
- Input validation is easier to do. If the parameter is numeric or a GUID, validation is more straightforward than having to validate a person name or file path.

For the challenge you must identify the code that references the resources _indirectly_ preventing the software flaws.