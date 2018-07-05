### Solution for "Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection') and related flaws" challenge

This challenge show a case where OS command injection happens when the software executes a command line.

To pass this challenge you must to print out /etc/passwd
- Try to input <mark>host.com|cat /etc/shadow</mark> in update server fielde. You will see the specific mark <mark>|</mark> was disappeared.
Because developer already replace some specific mark in code. <code>
updateServer = updateServer.replace("'","").replace("\"","").replace("`", "").replace("&", "").replace("|", "");</code>
- Try to use another mark which could execute multiple command in one line on Linux.

Note: If you forgot the admin credentials from the brute force challenge. Here is the Admin password <mark>iloveyou</mark>