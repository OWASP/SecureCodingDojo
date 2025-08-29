### Vulnerability Chaining

The CVSS framework is designed for assessing an individual vulnerability having known the details on exploitability and impact. However, it is sometimes necessary to look into more complex attacks that leverage multiple vulnerabilities into a chain. While the CVSS is not specifically designed for more complex attacks, it does accommodate for scoring a single attack consisting of a vulnerability chain.


Vulnerability chaining is covered in the [CVSS User Guide](https://www.first.org/cvss/v4-0/user-guide#Vulnerability-Chaining).

### Task

Score the following scenario using the CVSS v4.0 calculator [https://www.first.org/cvss/calculator/4-0](https://www.first.org/cvss/calculator/4-0).

<br><br>

### Scenario

This attack scenario consists of the 2 vulnerabilties we saw earlier. Imagine that an attacker is aware and has the ability to execute both of them as necessary to perform an attack.

You can leverage the CVSS vectors of the previous 2 vulnerabilities that we scored.

<br><br>

#### Vulnerability 1

Unauthenticated attacker can list registered users of a SaaS offering (username and userid).

<br><br>

#### Vulnerability 2

A malicious SaaS user with knowledge of another user’s unique 128-bit userid, can read all the information (e.g. details, activity, messages) for that user through an Authorization bypass in the API.

<br><br>

#### Impact

The attacker is now able to read the information for all users.

<br><br>
