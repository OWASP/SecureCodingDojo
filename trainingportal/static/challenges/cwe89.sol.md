### Solution for the "Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')" challenge

This challenge demonstrates the risks of SQL injection.


SQL injection is a very notorious security issue.
In the sample code, you might find some of special characters are being filtered but not all have been included.
To pass the challenge you must alter the backend SQL statement using **tautology**, so that the WHERE condition is always `true`.

1. admin'--
2. 'admin' or '1' = '1';
3. admin' or '1' = '1'
4. admin' or '1' = '1