### Task

Score the following scenario using the CVSS v4.0 calculator [https://www.first.org/cvss/calculator/4-0](https://www.first.org/cvss/calculator/4-0).

<br><br>

### Scenario

The company "PCGamingCompany.insecure.example" offers computer games to its customers. The service offers an easy sign up for new customers.

From a technical standpoint, they have a web client and a desktop client. In order for customers to play games, they have to download the desktop client and log into their account.

<br><br>

#### Vulnerability

A Local Privilege Escalation (LPE) vulnerability was identified in the desktop client. A low-privileged attacker on the machine can trick the gaming client into overwriting any file on the filesystem with attacker provided content by preparing a specially crafted symbolic link.

The attack works by leveraging the upgrade process which uses unsecured temporary folder for storing upgrade files. The desktop client will overwrite any file as a privileged user. As a result, the attacker can become a privileged user on the machine.

<br><br>