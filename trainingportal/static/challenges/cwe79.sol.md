### Solution for "Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting') and related flaws" challenge

This challenge shows input without validation any scripting input, enables attackers to inject client-side scripts.

To solve the challenge do the following:
* create an html img element with wrong src address, this would force browser trigger img onerror event handler.
* set your alert on this img element attribute onerror.