JavaScript’s biggest foe is **Cross-Site Scripting** (abbreviated `XSS`). This type of attack occurs when a web page accepts input containing JavaScript from an untrusted source and renders it in the context of the page. It’s practically a form of code injection.

To prevent the attack the application must **neutralize the user input**. Most modern JavaScript frameworks such as Angular and React do this implicitly.

Sometimes you must extend the JavaScript framework by designing your own UI elements. When doing this you must keep in mind that the following page contexts are dangerous since they will execute input as JavaScript.

Dangerous HTML element attributes: `innerHTML, src, onLoad, onClick, etc...`

Dangerous functions: `eval, setTimeout, setInterval`

Sometimes you will find yourself in the tricky situation of migrating a legacy enterprise application to a modern UI. In this scenario server side rendered code (JSP, PHP, ASPX) co-exists with modern pages and maintenance of the server side code may introduce new Cross-Site Scripting issues, if user input is not neutralized. In those cases **HTML Encoding** functions have to be called to turn hazardous HTML markup into safe strings.