## [CVE-2025-4427](https://nvd.nist.gov/vuln/detail/CVE-2025-4427)

### Description
An authentication bypass in the API component of Ivanti Endpoint Manager Mobile 12.5.0.0 and prior allows attackers to access protected resources without proper credentials via the API.

### CVSS Score

**NOTE:** The official NVD entry for this vulnerability contains 2 separate CVSS scores: one provided by the vendor and one provided by the National Vulnerability Database (NVD). The discrepancy here is in the impact metric for `Confidentiality`. The vendor claims `Low` impact, while the NVD claims `High` impact. This example demonstrates how even the technical aspects alone can be subject to interpretation and discussion.

#### Vulnerability Dissection

Looking at the description, we can inform some of the CVSS metrics:

- `authentication bypass in the API` and `without proper credentials`
    - Attack Vector: Network (`AV:N`) *(assuming a Web API)*
    - Privileges Required: None (`PR:N`)
- `access protected resources`
    - Confidentiality: High (`VC:H`)

The rest we can keep with the CVSS defaults i.e. no exploitability requirements and no impact.

#### CVE Official CVSS v3.1 Score
NVD: 7.5 High [CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N](https://www.first.org/cvss/calculator/3-1#CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)

#### Proposed CVSS v4.0 Score

8.7 High [CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N](https://www.first.org/cvss/calculator/4-0#CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N)

<br><br>

---

## [CVE-2020-4004](https://nvd.nist.gov/vuln/detail/CVE-2020-4004)

### Description

VMware ESXi (7.0 before ESXi70U1b-17168206, 6.7 before ESXi670-202011101-SG, 6.5 before ESXi650-202011301-SG), Workstation (15.x before 15.5.7), Fusion (11.x before 11.5.7) contain a use-after-free vulnerability in the XHCI USB controller. A malicious actor with local administrative privileges on a virtual machine may exploit this issue to execute code as the virtual machine's VMX process running on the host.

### CVSS Score

#### Vulnerability Dissection

Looking at the description, we can inform some of the CVSS metrics:

- `local administrative privileges`
    - Attack Vector: Local (`AV:L`)
    - Privileges Required: High (`PR:H`)
- `on a virtual machine` and `virtual machine's VMX process running on the host`
    - Scope: Changed (`S:C`) in CVSS v3
    - Subsequent System impact in CVSS v4
- `VMX process`
    - The VMX process is a privileged process on the host, so all impact is High (`VC:H/VI:H/VA:H/SC:H/SI:H/SA:H`)

#### CVE Official CVSS v3.1 Score
NVD: 8.2 High [CVSS:3.1/AV:L/AC:L/PR:H/UI:N/S:C/C:H/I:H/A:H](https://www.first.org/cvss/calculator/3-1#CVSS:3.1/AV:L/AC:L/PR:H/UI:N/S:C/C:H/I:H/A:H)

#### Proposed CVSS v4.0 Score
9.3 Critical [CVSS:4.0/AV:L/AC:L/AT:N/PR:H/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H](https://www.first.org/cvss/calculator/4-0#CVSS:4.0/AV:L/AC:L/AT:N/PR:H/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H)

<br><br>

---

## [CVE-2025-40591](https://nvd.nist.gov/vuln/detail/CVE-2025-40591)

### Description

A vulnerability has been identified in RUGGEDCOM ROX MX5000 (All versions < V2.16.5) ... . The 'Log Viewers' tool in the web interface of affected devices is vulnerable to command injection due to missing server side input sanitation. This could allow an authenticated remote attacker to execute the 'tail' command with root privileges and disclose contents of all files in the filesystem.

### CVSS Score

#### Vulnerability Dissection

Looking at the description, we can inform some of the CVSS metrics:

- `authenticated remote attacker`
    - Attack Vector: Network (`AV:N`)
    - Privileges Required: Low (`PR:L`)
- `disclose contents of all files`
    - Confidentiality: High (`C:H`)
    - **Note**: Apart from the files of the application itself, an attacker can also read all files on the host. Hence, we have change of scope from the vulnerable system (the web application) with its own Authentication and Authorization (i.e. security scope) to the subsequent system (the host itself).

#### CVE Official CVSS v4.0 Score
Siemens AG: 8.3 High [CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:H/SI:N/SA:N](https://www.first.org/cvss/calculator/4-0#CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:H/SI:N/SA:N)

<br><br>

---

## [CVE-2025-34124](https://nvd.nist.gov/vuln/detail/CVE-2025-34124)

### Description

A buffer overflow vulnerability exists in Heroes of Might and Magic III Complete 4.0.0.0, HD Mod 3.808 build 9, and Demo 1.0.0.0 via malicious .h3m map files that exploit object sprite name parsing logic. The vulnerability occurs during in-game map loading when a crafted object name causes a buffer overflow, potentially allowing arbitrary code execution. Exploitation requires the victim to open a malicious map file within the game.

### CVSS Score

#### Vulnerability Dissection

Looking at the description, we can inform some of the CVSS metrics:

- `via malicious .h3m map files`
    - Attack Vector: Local (`AV:L`)
- `Exploitation requires the victim to open a malicious map file within the game`
    - User Interaction: Active (`UI:A`)
- `arbitrary code execution`
    - Confidentiality: High (`VC:H`)
    - Integrity: High (`VI:H`)
    - Availability: High (`VA:H`)

#### CVE Official CVSS v4.0 Score

VulnCheck: 8.4 High [CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:A/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N](https://www.first.org/cvss/calculator/4-0#CVSS:4.0/AV:L/AC:L/AT:N/PR:N/UI:A/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N)