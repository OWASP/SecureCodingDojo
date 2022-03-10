In the previous lesson we reviewed Input Validation. While Input Validation is an effective deterrent to a large number of attacks, including Injection, not all input can be filtered.

For example a person who's last name is O’Brien. The single quote in O’Brien happens to also be part of SQL command syntax. For example a website may perform a database record search like this:

    SELECT * FROM users WHERE last_name = 'O'BRIEN'

Notice that the single quote in the name O'Brien is causing a syntax error. The SQL command processor considers the string ends with O and the rest, BRIEN', is just an unrecognized command.

Let’s take a look at the following code snippet.

    Connection conn = db.getConn();
    String lastName = request.getParameter("last_name");
    String query = "SELECT * FROM users WHERE last_name = '"+lastName+"'";
    Statement stmt = conn.createStatement();
    ResultSet rs = stmt.executeQuery(query);

The variable lastName contains input coming from the user. It is `concatenated` to a constant SQL query string and the resulting command is passed to the database server. This means that a user entering O’Brien would cause an SQL syntax error, which is a bug. However a malicious user would take advantage of this behaviour. What would happen if the user entered something like the string below?

    '; DROP TABLE users; --

The SQL query being passed to the database would end up being two different commands. One performs a query, while the other deletes the users table.

    SELECT * FROM users WHERE last_name = ''; DROP TABLE users; --'

While **input validation** would prevent the attack, we can't use it for the last name since that would mean we would prevent single quotes in user names. 
There's a more elegant solution: `don't use concatenation`. Instead, pass the variables to the command processor separate from the SQL query, neutralizing characters that may influence the query. This is done using Parameterized Statements, and it also works to mitigate other Injection scenarios such as injection in the OS command processor.

Below is the same code using parameterized statements in Java.

    Connection conn = db.getConn();
    String lastName = request.getParameter("last_name");
    String query = "SELECT * FROM users WHERE last_name = ?";
    PreparedStatement stmt = conn.preparedStatement();
    stmt.setString(1,lastName);
    ResultSet rs = stmt.executeQuery(query);

In this challenge you must code review 2 different examples, one for OS commands and one for SQL commands and identify those that implement the safe approach. 