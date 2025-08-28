### Task

Score the following scenario using the CVSS v4.0 calculator [https://www.first.org/cvss/calculator/4-0](https://www.first.org/cvss/calculator/4-0).

<br><br>

### Scenario

The company "PCGamingCompany.insecure.example" offers computer games to its customers. The service offers an easy sign up for new customers.

From a technical standpoint, they have a web client and a desktop client. In order for customers to play games, they have to download the desktop client and log into their account.

<br><br>

#### Vulnerability

An authenticated attacker can leverage an Authorization bypass in the API and see all the games owned by a particular user.

**Note:** For this example we can assume that userids are easily guessable. This is an issue on its own, but is out of scope for this example.

<br><br>