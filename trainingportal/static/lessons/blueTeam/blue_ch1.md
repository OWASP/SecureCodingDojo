
You are deploying a container-based application that may include some serious vulnerabilities. 
You will setup some security controls to prevent attacks and verify that the controls work as intended.

#### Getting Set Up
Here are instructions on how to get your production environment going.

##### Set Up Your VM
Spin up a VM of your preference and ensure the VM IP is exposed to public for accessing the running service in the VM. To deploy the container-based application should have docker installed in the VM.

##### Install Security Software
Before deploying the vulnerable application, you should first install security software. Follow instructions at the provided link for deploying IPS and FW software.

##### Scan the Container Image
Use a container security scanner to spot web application vulnerabilities in your image. Web application container Image available in the provided AWS ECR Repo.
Container security scanner will multiple CVEs, look for the CVEs reported for a CMS web application. 

###### Configure IPS rules
Configure your IPS security software to block attacks. Find the IPS rule to protect the web application reported by the container scanner and deploy it in your IPS solution.

#### Instructions for Completing the Challenge
- Deploy container-based Web-Application in your VM with the port 8080.

* Pull the image from AWS ECR repo.

  `docker pull <aws_account_id>.dkr.ecr.<region>.amazonaws.com/<Imagename>:latest`

* Deploy the web-application.

  `docker run -p 8080:80 <Imagename>:latest`

* Verify your container running.

  `docker ps`

- Access the tester app at the provided address.

- Input your host and the challenge salt and run test. Get the challenge salt by clicking on submit code of this challenge.

- Verify that the security software has blocked the attack and find the challenge code in the IPS events payload data. 

- Look for the IPS rule triggers assigned to protect the web application. 
