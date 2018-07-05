### Solution for "Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')" challenge

This challenge demonstrates the risk of SQL injection .


SQL injection is more popular in Security issue.
In the sample code, you might find some of special string filtering but not all of included.
To pass the challenge, you can try the following scripts for Where condition in input field.
1. admin'--
2. 'admin' or '1' = '1';
3. admin' or '1' = '1'
4. admin' or '1' = '1