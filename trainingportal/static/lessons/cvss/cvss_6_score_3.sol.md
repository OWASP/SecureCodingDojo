High-level analysis:

- Prerequisites:
    - None. Even if from technical point of view the API does require authentication, it is easy for an attacker to obtain a normal account and leverage that. Per the [CVSS Specification](https://www.first.org/cvss/v4-0/specification-document#Privileges-Required-PR): "Generally, self-service provisioned accounts do not constitute a privilege requirement if the attacker can grant themselves privileges as part of the attack".
- Impact:
    - Some non-sensitive data are exposed

---

CVSS:

- Attack Vector: Network (N)
- Attack Complexity: Low (L)
- Attack Requirements: None (N)
- Privileges Required: None (N)
- User Interaction: None (N)
- Vulnerable SystemConfidentiality: Low (L)
- Vulnerable System Integrity: None (N)
- Vulnerable System Availability: None (N)
- Subsequent System Confidentiality: None (N)
- Subsequent System Integrity: None (N)
- Subsequent System Availability: None (N)