# About the Secure Coding Dojo
The Secure Coding Dojo is a platform for delivering secure coding training. 
While it comes with its own vulnerable training application (the Insecure.Inc website) the training portal can be used in conjunction with other  training applications.
The strength of the platform is its extensibility and the integration with the commonly used development collaboration platform Slack.
The training portal can be easily setup in the cloud and instructions for AWS ELB setup are available below.

Be sure to also check the [wiki](https://github.com/trendmicro/SecureCodingDojo/wiki) for more details on deploying and installing the Dojo.

# Demo

Download the [demo](https://github.com/trendmicro/SecureCodingDojo/blob/master/demo/Secure%20Coding%20Dojo%20Demo.mp4) to get a look and feel of the training portal and the Insecure.Inc application.

Also take a look in /screenshots
![Alt text](/screenshots/frontpage.png?raw=true "Secure Coding Dojo Training Portal Front Page")



# Why Another Security Training Site?
While open source training sites to teach application security concepts are not new the target audience for these sites has been pen-testers and ethical hackers. 
The Secure Coding Dojo is primarily intended as a delivery platform for developers and here's why:
-  It integrates with Slack for authentication
-  It allows grouping of participants according to their development teams
-  It allows teams to track progress and compete with each other
-  Each lesson is built as an attack/defense pair. The developers can observe the software weaknesses by conducting the attack and after solving the challenge they learn about the associated software defenses (code blocks) 
-  The predefined lessons are based on the MITRE most dangerous software errors (also known as SANS 25) so the focus is on software errors rather than attack techniques
-  The predefined hacking challenges are created for entry level and keep the developers engaged
    * Other training sites or CTFs there is a puzzle aspect to the challenges which is great for pen-tester audiences but can make some developers lose interest. In the Secure Coding Dojo the focus is on demonstrating the vulnerability.
    * There are tips that help the developers as they are exploiting the issue to avoid getting stuck

# SecureCodingDojo and Compliance Requirements
While we don't guarantee compliance the training could be used to meet compliance requirements such as PCI 6.5.a. See Insecure.Inc curriculum document on mapping to SANS 25/ OWASP Top 10 / PCI 6.5

# Development Pre-requisites
Training portal
- Install VS Code (developed with 1.14)
- node/npm (developed with v6.10)
- MySQL server + My SQL Workbench (developed with MySQL 5.7)

Insecure.Inc
- Developed in Java EE
- Eclipse Java EE latest version (developed with Neon) + Java 1.8 + tomcat 8 for the Insecure.Inc training app


# Slack Setup Instructions
You will need to create a Slack app for authentication.
- Go to https://api.slack.com/
- Hit Start Building and follow the prompts to create a Slack App in your Development Slack Team
- Once your app is created you will be able to get your App Credentials to configure your config.js
- Configure redirect urls under OAuth & Permissions. For example for a localhost setup the redirect url would be: http://localhost:8081/public/slack/callback


# Google Setup Instructions
Google authentication can also be configured in config.js. You will need a Google developer account and obtain the OAuth credentials from the Google API console: https://console.developers.google.com

In the same place you will setup your domain and authorized redirect URIs. For example for a localhost setup the redirect url would be: http://localhost:8081/public/google/callback

# Local Authentication Setup Instructions
For small teams or pre-configured images Slack or Google authentication may not be an option. For this scenario you can configure authentication working with a local flat file.

- Copy localUsers.json.sample to localUsers.json
- Un-comment the line in config.js which specifies the localUsersPath
- Un-comment the line in encryptConfigs.js that calls the genLocalUser function and fill in accordingly. 
- Copy paste the line as needed for all the users you need to create

        genLocalUser("organizer","Organizer","","<enter your password here>");//DELETE ME WHEN DONE

- After running encryptConfigs.js copy paste the generated line in localUsers.json
- There are several caveats with local authentication such as users not being able to change their own passwords, missing account lockout, password expiration etc.

# DB Setup Instructions
Install MySQL and create a DB and credentials for that DB. Note your user name and password you will need them for later.

# Encryption Key Seeds and Environment Variables
You will have to setup four seeds for encryption keys as OS environment variables. On *nix/mac modify .bash_profile as follows

    export ENC_KEY="put something random here"
    export ENC_KEY_IV="put something random here"

The following two are optional but recommended. They will cause the challenge secrets to be stored encrypted on the hard drive.

    export CHALLENGE_KEY="put something random here"
    export CHALLENGE_KEY_IV="put something random here"

You will also have to configure environmental settings such as the below

    export DOJO_DB_HOST="localhost"
    export DOJO_URL="http://localhost:8081"
    export DOJO_TARGET_URL="http://localhost:8080/InsecureInc"


# Environment Setup Instructions
Training portal
- Change directory to ./trainingportal
- Run npm install (to download all necessary dependencies)
- Open VSCode and open the repository directory
- To download all the required node packages change directory to  ./trainingportal and run npm install
- Copy ./trainingportal/config.js.sample to ./trainingportal/config.js
- Copy ./trainingportal/challengeSecrets.json.sample to ./trainingportal/challengeSecrets.json
- Copy ./insecureinc/src/inc/insecure/code.properties.sample to ./insecureinc/src/inc/insecure/code.properties
- Open ./trainingportal/encryptConfigs.js, fill in db password, the Slack OAuth secret, the Google OAuth secret; etc. 
- Change the value of the regenerateSecrets variable to true, to generate new challenge secrets. Otherwise the sample values will be used and people may be able to cheat.
- Debug the script in VSCode to generate encrypted configuration settings in the Console.
- Copy the Console output to each corresponding file.
- Delete passwords from the encryptConfigs.
- Open ./trainingportal/server.js and debug it in VSCode (at the first run the DB tables will get created)
- The trainingportal server will be running on http://localhost:8081/ 

Insecure.Inc
- Add a Tomcat 8.0 server you have installed to your Eclipse > Servers view
- Import the insecureinc project into your Workspace (Import > Import > Existing Projects into Workspace)
- Debug on server
- The Insecure.Inc website will be running on http://localhost:8080/InsecureInc

# Building
Training portal
- N/A

Insecure.Inc 
- Right click on the project to export as a .war file and drop it into the /webapps folder of your Tomcat 8 installation.

NOTE: You can download a pre-built version of insecureinc.war from /build however make sure you change and encrypt the values in WEB-INF/classes/inc/insecure/codes.properties after deployment with encryptConfigs.js. 

# Hosting Insecure.Inc
Note: Don't put Insecure.Inc on a publicly facing server or in AWS since activity against it may trigger IPS alarms, etc. 

Setup a Tomcat 8 server.

If you configured a key for storing the challenge secrets encrypted you need to perform the following step.

Tomcat will ignore environment variables so you will have to configure the challenge key in /opt/tomcat/bin/setenv.sh
(or wherever you had tomcat installed) like so:

    export CHALLENGE_KEY="our challenge key seed"
    export CHALLENGE_KEY_IV="your challenge key iv seed"


# Deploying the Training Portal on AWS ELB
AWS ELB setup is pretty standard. Configure the RDS DB separately because once you setup the environment you can't easily switch or delete databases.

Training portal
- Setup the RDS DB and credentials first
    * Use the encryptConfigs.js script to generate new encrypted db password config.js if different then your local environment
- Create an ELB environment using node
- When creating the environment choose to define environment properties, under Software Configuration, as below

        ENC_KEY="your enc key seed"
        ENC_KEY_IV="your enc iv seed"
        CHALLENGE_KEY="your challenge key seed"
        CHALLENGE_KEY_IV="your challenge key iv seed"
        DOJO_DB_HOST="your AWS RDS mysql host"
        DOJO_URL="https://elburl"
        DOJO_TARGET_URL="http://internalhost:8080/InsecureInc"


# Extending the Secure Coding Dojo
You can add new lessons by following the model of existing ones.

## Challenges 
Challenges are defined in ./trainingportal/static/challenges
The file challengeDefinitions.json points to the corresponding html challenge description, play link and corresponding code blocks by code block id.
Follow the already defined examples to create a new one.

    .
    +-- /trainingportal/static/challenges
    |   +-- challengeDefinitions.json //configuration file where challenges are grouped by levels and defined
    |   +-- cwe22.html //challenge description html
    |   ...
    |   +-- quiz.html //the quiz is also a challenge


## Code Blocks 
Code Blocks are defined in  ./trainingportal/static/codeBlocks. This folder has a similar structure with a definition json and a bunch of html files for each challenge.

    .
    +-- /trainingportal/static/codeBlocks
    |   +-- codeBlocksDefinitions.json //configuration file where code blocks are defined
    |   +-- authenticationByDefault.html //code block description html
    |   ...
    |   +-- useStrongDataEncryption.html 

## Challenge codes
In order to ensure people don't just copy/paste challenge codes from each other to pass the lessons, the codes are salted and hashed by Insecure.Inc with a salt generated by the training portal. This way the verification code required to complete a lesson changes every time.

If you want to create your own version of Insecure.Inc containing different challenges and maybe on a different platform you can see how the verification codes are generated in Java Resources > src > inc.insecure > GetCode.java

As for the challenge codes which are secrets shared between the vulnerable site and the training portal, simply add a new challenge code line in challengeSecrets.json and use the sample code in encryptConfigs.js to encrypt it and save it in your vulnerable page.

You can also create a new jsp in the Insecure.Inc app and leverage the existing code to add a new lesson. The Insecure.Inc site stores its challenge codes in ./insecureinc/src/inc/insecure/code.properties






