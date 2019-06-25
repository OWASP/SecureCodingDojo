### Solution for the "Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting') and related flaws" challenge

This challenge shows how missing input validation and improper output encoding, enable attackers to inject client-side scripts.

To solve the challenge do the following:

* Create an html img element with wrong **src** address, this would force browser trigger img onerror event handler: `<img src=bla onerror=alert('FIRE!')>`
* Submit this value as the **Display Name** profile attribute