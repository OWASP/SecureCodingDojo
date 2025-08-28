### Task

Score the following scenario using the CVSS v4.0 calculator [https://www.first.org/cvss/calculator/4-0](https://www.first.org/cvss/calculator/4-0).

<br><br>

### Scenario

The company "PCGamingCompany.insecure.example" offers computer games to its customers. The service offers an easy sign up for new customers.

From a technical standpoint, they have a web client and a desktop client. In order for customers to play games, they have to download the desktop client and log into their account.

<br><br>

#### Vulnerability

An attacker can cause a denial of service impact on the telemetry service by providing specially crafted data. The attacker can maliciously change the filename of a locally available game (installed by the gaming desktop client). The desktop client will then try to report this filename and the telemetry service will crash. As a result, customers won't be able to see their gaming statistics, but will still be able to play normally their games.

<br><br>