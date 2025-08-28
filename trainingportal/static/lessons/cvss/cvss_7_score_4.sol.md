High-level analysis:

- Prerequisites:
    - None. Even if from technical point of view the API does require authentication, it is easy for an attacker to obtain a normal account and leverage that. Per the [CVSS Specification](https://www.first.org/cvss/v4-0/specification-document#Privileges-Required-PR): "Generally, self-service provisioned accounts do not constitute a privilege requirement if the attacker can grant themselves privileges as part of the attack".
- Impact:
    - There is High impact on Confidentiality as all files on the victim's machine can be read by the attacker.
        - While the attacker leverages the Vulnerable System (i.e. the Web API), the impact is on a Subsequent System (i.e. the victim's machine), so we have a change of scope and impact on Subsequent System

---

CVSS:

- Attack Vector: Network (N)
- Attack Complexity: Low (L)
- Attack Requirements: None (N)
- Privileges Required: None (N)
- User Interaction: None (N)
- Vulnerable System Confidentiality: None (N)
- Vulnerable System Integrity: None (N)
- Vulnerable System Availability: None (N)
- Subsequent System Confidentiality: High (H)
- Subsequent System Integrity: None (N)
- Subsequent System Availability: None (N)
