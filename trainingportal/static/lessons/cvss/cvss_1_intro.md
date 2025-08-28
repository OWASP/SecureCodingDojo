## The Common Vulnerability Scoring System (CVSS)

<br>

The Common Vulnerability Scoring System (CVSS) is an *open framework for communicating the characteristics and severity of software vulnerabilities*. You can find the most complete and up-to-date information on CVSS at [https://www.first.org/cvss/](https://www.first.org/cvss/). The current version of the CVSS specification is CVSS v4 with CVSS v3 still being widely used. CVSS provides a standardized vendor agnostic and platform agnostic methodology and produces a CVSS Score value between 0 and 10 and a CVSS rating:

- 9.0 - 10.0 Critical
- 7.0 - 8.9 High
- 4.0 - 6.9 Medium
- 0.1 - 3.9 Low
- 0.0 None



The CVSS score is produced by choosing the corresponding values for each CVSS metric (metrics will be covered in detail later in this chapter). The final set of all metrics is represented in the so called CVSS Vector e.g. `CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N`. This example is decoded as:

- `AV:N` -> Attack Vector (AV): Network (N)
- `AC:L` -> Attack Complexity (AC): Low (L)
- `AT:N` -> Attack Requirements (AT): None (N)
- `PR:N` -> Privileges Required (PR): None (N)
- `UI:N` -> User Interaction (UI): None (N)
- `VC:H` -> Vulnerable System Confidentiality (VC): High (H)
- `VI:H` -> Vulnerable System Integrity (VI): High (H)
- `VA:N` -> Vulnerable System Availability (VA): None (N)
- `SC:N` -> Subsequent System Confidentiality (SC): None (N)
- `SI:N` -> Subsequent System Integrity (SI): None (N)
- `SA:N` -> Subsequent System Availability (SA): None (N)

Just by looking at the CVSS Vector, we can understand the (high-level) story behind the vulnerability. In this example we can see that: An unauthenticated attacker (`AV:N/AC:L/AT:N/PR:N/UI:N`) can read and write sensitive data (`VC:H/VI:H/VA:N`).

<br><br><br>

---

### It is important to note that CVSS `is not a` *Risk Score*.

<br><br>

CVSS gives us a **technical score** of a vulnerability. It does **NOT** deal with any business, financial, health or any other form of risk. To better understand this, consider the following example:

 - 2 different vulnerabilities
 - The same CVSS score of 9.0 Critical
 - One of those is in a music player / sound device
 - The other is in a medical software responsible for delivering health-critical medical services to patients

The CVSS specification explicitly covers that vulnerability management should consider factors that are outside of CVSS:

    Consumers may use CVSS information as input to an organizational vulnerability management
    process that also considers factors that are not part of CVSS in order to rank the threats
    to their technology infrastructure and make informed remediation decisions. Such factors may
    include, but are not limited to: regulatory requirements, number of customers impacted,
    monetary losses due to a breach, life or property threatened, or reputational impacts of a
    potential exploited vulnerability. These factors are outside the scope of CVSS.

---

<br><br><br>

## CVSS Metric Groups

<br>

CVSS v4 has 4 metric groups:

- Base.
    - Intrinsic characteristics
    - Constant over time
    - Assumes reasonable worst-case impact
- Threat.
    - The current state of exploitability and remediation
    - Can only go lower than the Base score
- Environmental.
    - Adjusted to specific environment
    - Considers mitigating factors
    - Considers adverse effects
    - Can go higher or lower than the Base score
- Supplemental.
    - Context and additional extrinsic attributes
    - No impact on the CVSS score

For the remainder of this chapter, we will be focusing only on the Base metric group as it provides the most robust measure of a vulnerability's characteristics. The Environmental group is also very effective for adjusting the exploitability and impact metrics for a particular environment and can be viewed as a modification to the Base metric.


## CVSS Base Score

CVSS Base metrics go into 2 broad categories:

- **Exploitability**. How easy/hard it is to exploit the vulnerability and what the prerequisites are.
    - `Attack Vector (AV)`
    - `Attack Complexity (AC)`
    - `Attack Requirements (AT)`
    - `Privileges Required (PR)`
    - `User Interaction (UI)`
- **Impact**. The security properties being violated.
    - *Vulnerable System*. The system that has the vulnerability.
        - `Confidentialiy (VC)`
        - `Integrity (VI)`
        - `Availability (VA)`
    - *Subsequent System*. Other dependent system(s) being impacted.
        - `Confidentiality (SC)`
        - `Integrity (SI)`
        - `Availability (SA)`

<br><br><br>

### Exploitability Metrics

#### [Attack Vector (AV)](https://www.first.org/cvss/v4-0/specification-document#Attack-Vector-AV)
- **Question**: From where can an attacker execute the attack?
- **Values**:
    - Network (`N`)
        - Remotely over the network
        - **Examples**:
            - Web-based attacks
    - Adjacent (`A`)
        - Local/Adjacent network (physical or logical)
        - **Examples**:
            - Physical proximity
                - Bluetooth
                - WiFi
            - Logical proximity
                - ARP
                - DHCP
    - Local (`L`)
        - Not bound to the network stack
        - **Examples**:
            - Vulnerable lock screen
            - Malware infected document
            - Local Privilege Escalation (LPE)
    - Physical (`P`)
        - Physical access to the device
        - **Examples**:
            - Malicious USB device
            - Evil Maid attacks

#### [Attack Complexity (AC)](https://www.first.org/cvss/v4-0/specification-document#Attack-Complexity-AC)

- **Question**: What are the requirements for bypassing security-enhancing conditions/controls?
- **Values**:
    - Low (`L`) 
        - The attack requires no target-specific defense circumvention
        - **Examples**:
            - Most web attacks
    - High (`H`)
        - The attack requires evasion or circumvention of security-enhancing techniques in place that would otherwise hinder the attack:
            - address space layout randomization (ASLR)
            - data execution prevention (DEP)
            - Obtaining target-specific secrets
        - **Examples**:
            - [regreSSHion CVE-2024-6387](https://www.first.org/cvss/v4-0/examples#regreSSHion-CVE-2024-6387)
                - Attackers must defeat memory safety defenses in order to achieve code execution

#### [Attack Requirements (AT)](https://www.first.org/cvss/v4-0/specification-document#Attack-Requirements-AT)

- **Question**: Are there any non-security-specific conditions that need to be overcome?
- **Values**:
    - None (`N`)
        - No special requirements or conditions
        - **Examples**:
            - Most web attacks
    - Present (`P`)
        - The attack requires the presence of a specific condition that is not always present
        - **Examples**:
            - Race condition requiring a very specific timing window
            - Man-in-the-Middle (MitM) attacks

#### [Privileges Required (PR)](https://www.first.org/cvss/v4-0/specification-document#Privileges-Required-PR)

- **Question**: What privileges does an attacker need (themselves, not the victim)?
- **Values**:
    - None (`N`)
        - No need for authentication
        - **Examples**:
            - SQL injection on the login page
    - Low (`L`)
        - Authentication required, but only low privileges
        - **Examples**:
            - Low-privileged user can access the admin panel
            - Logged in attacker is able to change other users’ data
    - High (`H`)
        - Attacker needs significant privileges (e.g. admin)
        - **NOTE**: In CVSS we only measure the impact of a vulnerability in terms of what is gained by exploiting it. It wouldn't make sense to score legitimate administrative capabilities as impact.
        - **Examples**:
            - Exploit only possible through the admin panel of a Web app
            - Change of scope vulnerabilities such as a privileged user on a VM/container can escape into the host and execute commands there

#### [User Interaction (UI)](https://www.first.org/cvss/v4-0/specification-document#User-Interaction-UI)

- **Question**: What are the requirements on the user/victim for the attack to succeed?
- **Values**:
    - None (`N`)
        - Attacker can exploit without any interaction from any user/victim
        - **Examples**:
            - SQL injection on the login page
    - Passive (`P`)
        - Requires only limited interaction or normal/ordinary user behaviour
        - **Examples**:
            - A user will be compromised if they simply open a malicious message/email/sms within the application (not having to further follow any links)
            - A malicious user can change their user info so that an account takeover occurs whenever the admin user generates reports (assuming report generation is a normal/expected activity)
            - A stored cross-site scripting (XSS) in the default dashboard that loads after user log-in
    - Active (`A`)
        - Requires a behaviour that is out of the ordinary, against recommended guidance, or subverting security controls
        - **Examples**:
            - An email with malicious attachment that the victim needs to explicitly download and execute
            - The user must explicitly accept/override a security warning such as certificate/TLS issues reported by the browser
            - Reflected cross-site scripting (XSS) where the victim needs to follow a malicious link

### Impact Metrics

#### CIA

In CVSS impact is measured against the security properties:

- **Confidentiality (C)**. Attackers can't read data.
- **Integrity (I)**. Attackers can't modify data.
- **Availability (A)**. Attackers can't disrupt the service.

Impact is only measured in terms of what is gained by exploiting a vulnerability. For example, a vulnerability that allows a read-only user to modify some data should only be scored with Integrity impact. The impact should be contained to what can be proven or reasonably expected.

**NOTES**:

- Brute-forcing cryptographically secure algorithms with sufficient key size and entropy should be considered neither reasonable nor practical
- Finding a collision in a hashing function known to be broken (such as SHA-1) has to be considered reasonable (as proven in the shattered attack), even if not computationally/financially feasible for non-financially capable attackers.

#### Scope (Vulnerable System Impact vs Subsequent System Impact)

CVSS v4 introduces separate impact scores for the Vulnerable (`V`) system and Subsequent (`S`) systems (previously in CVSS v3 this used to be marked by a Scope (`S`) metric).

The CVSS documentation includes a [User Guide](https://www.first.org/cvss/v4-0/user-guide#Vulnerable-System-and-Subsequent-System) with some examples on scope scoring.

Examples of change of scope (vulnerable to subsequent) for impact:

- vulnerability in a virtualization hypervisor that allows a virtual machine "escape" from the VM onto the host (similarly, container escape)
- cross-site scripting (XSS) vulnerabilities. The vulnerable system is the web server, but the impacted system (i.e. subsequent) is the victim's web browser.

#### [Confidentiality (VC/SC)](https://www.first.org/cvss/v4-0/specification-document#Confidentiality-VC-SC)

- **Security Property**. Attackers can't read data.
- **Values**:
    - None (`N`)
        - No impact
    - Low (`L`)
        - Read access to some restricted data:
            - No control over which data
            - Amount/kind is limited
        - **Examples**:
            - Attacker can read internal debug messages and see some internal details (e.g. IP addresses), but no secrets or critical information
            - Attacker can see user statistics
    - High (`H`)
        - Read all data or critical data
        - **Examples**:
            - SQL injection allowing database dump of the whole database
            - Attacker can read another user's access tokens

#### [Integrity (VI/SI)](https://www.first.org/cvss/v4-0/specification-document#Integrity-VI-SI)

- **Security Property**. Attackers can't modify data.
- **Values**:
    - None (`N`)
        - No impact
    - Low (`L`)
        - Read access to some restricted data:
            - No control over which data
            - Amount/kind is limited
        - **Examples**:
            - Attacker can change another user's avatar image
    - High (`H`)
        - Modify all data or critical data
        - **Examples**:
            - SQL injection allowing database modifications
            - Attacker can set another user's authentication details (e.g. password, tokens)


#### [Availability (VA/SA)](https://www.first.org/cvss/v4-0/specification-document#Availability-VA-SA)

- **Security Property**. Attackers can't disrupt the service.
- **Values**:
    - None (`N`)
        - No impact
    - Low (`L`)
        - Some impact (performance) or partial impact
        - **Examples**:
            - Computationally intensive cryptographic operation can be abused to partially overload the CPU and cause slower server responses, but cannot completely deny the service
            - Attacker can deny some non-critical functionality e.g. report generation
    - High (`H`)
        - Full service denial or critical parts being denied
            - Fully deny access
                - Sustained (for the duration of the attack)
                - Persistent (even after the attack)
            - Deny only access to some critical resources
                - User login sessions
        - **Examples**:
            - Attacker can abuse a particular operation that would overload the server and prevent it from serving clients for the next 10 seconds. The attacker can sustain the attack with 1 request every 9-10 seconds.
            - Attacker can send a malformed request the would crash the server. The service will no longer be available until it is manually restarted.
            - Attacker can break the login functionality. Existing sessions remain intact, but users cannot sign in anymore (sustained or persistent).


---

**Resources**:

 - CVSS Documentation: [https://www.first.org/cvss/](https://www.first.org/cvss/)
 - CVSS 4.0 Calculator: [https://www.first.org/cvss/calculator/4-0](https://www.first.org/cvss/calculator/4-0)
 - CVSS Examples: [https://www.first.org/cvss/v4-0/examples](https://www.first.org/cvss/v4-0/examples)
 - CVSS User Guide: [https://www.first.org/cvss/v4-0/user-guide](https://www.first.org/cvss/v4-0/user-guide)
