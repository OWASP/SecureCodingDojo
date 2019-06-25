### Solution for the "Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection') and related flaws" challenge

This challenge demonstrates the dangers associated with `shelling out` and allowing hazardous characters from user input into `os commands`.

To pass this challenge you must to print out /etc/passwd

* Try to input **insecure.inc`|cat /etc/shadow`** in the **Update server:** field. You will see the `|` character was removed because the developer already implemented some rudimentary sanitization for hazardous characters. However the developer should have used **input whitelisting** instead.

        updateServer = updateServer.replace("'","").replace("\"","").replace("`", "").replace("&", "").replace("|", "");

* To perform the Injection use another special character, which has been forgotten from the sanitization code above: `;`.

**NOTE**: If you forgot the admin credentials from the brute force challenge. Here is the Admin password `iloveyou`