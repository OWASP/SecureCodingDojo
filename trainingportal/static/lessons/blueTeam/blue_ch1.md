You are deploying a container based application that may include some serious vulnerabilities. 
You will setup some security controls to prevent attacks and verify that the controls work as intended.

#### Getting Set Up
Here are instructions on how to get your production environment going.

##### Set Up Your VM
Spin up a VM of your preference. Should have docker deployed. You need remote access to the VM.

##### Install Security Software
Before deploying the vulnerable app you should first install security software. Follow instructions at the provided link for deploying IPS and FW software.

##### Scan the Container Image
Use a container security scanner to spot vulnerabilities in your image

##### Configure IPS rules
Configure your IPS security software to block attacks

#### Instructions for Completing the Challenge
- Open the FW ports for the image
- Access the tester app at the provided address
- Input your host and the challenge salt and run test
- Verify that the security software has blocked the attack and find the challenge code in the IPS events