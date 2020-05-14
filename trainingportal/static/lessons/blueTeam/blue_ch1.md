
You are deploying a container-based application that may include some serious vulnerabilities. 
You will setup some security controls to prevent attacks and verify that the controls work as intended.

#### Getting Set Up
Here are instructions on how to get your production environment going.

##### Set Up Your VM
Spin up a VM of your preference and ensure the VM IP is exposed to public for accessing the running service in the VM. To deploy the container-based application should have docker installed in the VM.

##### Install Security Software
Before deploying the vulnerable application, you should first install security software. Follow instructions at the provided link for deploying IPS and FW software.

###### Configure IPS rules
There is a well known web application that is running on one of the container ports.
Find the IPS rules to protect this app and deploy it in your IPS configuration.

#### Instructions for Completing the Challenge
- Deploy container-based Web-Application in your VM 

* Pull the image from AWS ECR repo.

  `docker pull <aws_account_id>.dkr.ecr.<region>.amazonaws.com/<Imagename>:latest`

* Deploy the web-application.

  `docker run -p 8080:80 -p 8888:8888 <Imagename>:latest`

* Verify your container running.

  `docker ps`

- You will be provided tester application that can be used to verify that the IPS is blocking attacks. 

- Input your host and the challenge salt and run the test. (Get the challenge salt by clicking on submit code of this challenge)

- Verify that the security software has blocked the attack and find the challenge code in the IPS events payload data. 

