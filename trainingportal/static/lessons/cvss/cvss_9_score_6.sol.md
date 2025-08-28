High-level analysis:

- Prerequisites:
    - The attacker needs to have a local access as a low-privileg user on the system they want to gain privileges on
- Impact:
    - Complete compromise of the system where the gaming desktop client is installed
        - **NOTE**: There is no change of scope here from a Vulnerable System to a Subsequent System.
            - This case is covered in the [CVSS User Guide](https://www.first.org/cvss/v4-0/user-guide#Vulnerable-System-and-Subsequent-System) (PDF reader example).
            - The gaming desktop client does not have its own local Authorization and Authentication functionality.
            - However, the product makes the customer insecure as it provides an LPE attack surface.

---

CVSS:

- Attack Vector(AV): Local (L)
- Attack Complexity (AC): Low (L)
- Attack Requirements (AT): None (N)
- Privileges Required (PR): Low (L)
- User Interaction (UI): None (N)
- Vulnerable System Confidentiality(VC): High (H)
- Vulnerable System Integrity (VI): High (H)
- Vulnerable System Availability (VA): High (H)
- Subsequent System Confidentiality (SC): None (N)
- Subsequent System Integrity (SI): None (N)
- Subsequent System Availability (SA): None (N)