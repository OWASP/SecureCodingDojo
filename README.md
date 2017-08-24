# About the Secure Coding Dojo
The Secure Coding Dojo is a platform for delivering secure coding training. 
While it comes with its own vulnerable training application (the Insecure.Inc website) the training portal can be used in conjunction with other  training applications.
The strength of the platform is its extensibility and the integration with the commonly used development collaboration platform Slack.
The training portal can be easily setup in the cloud and instructions for AWS ELB setup are available below.

#Screenshots
Check out the screenshots dir to get a look and feel of the training portal and the Insecure.Inc application.

# Why Another Security Training Site?
While open source training sites to teach secure coding training are not new the target audience for these sites has been pen-testers and ethical hackers. 
The Secure Coding Dojo is primarily intended as a delivery platform for developers and here's why:
-  It integrates with Slack for authentication
-  It allows grouping of participants according to their development teams
-  It allows teams to track progress and compete with each other
-  Each lesson is built as an attack/defense pair. The developers can observe the software weaknesses by conducting the attack and after solving the challenge they learn about the associated software defenses (code blocks) 
-  The predefined lessons are based on the MITRE most dangerous software errors (also known as SANS 25) so the focus is on software errors rather than attack techniques
-  The predefined hacking challenges are created for entry level and keep the developers engaged
    * Other training sites or CTFs there is a puzzle aspect to the challenges which is great for pen-tester audiences but can make some developers lose interest. The focus is on demonstrating the vulnerability
    * There are tips that help the developers as they are exploiting the issue to avoid getting stuck

# SecureCodingDojo and Compliance Requirements
While we don't guarantee compliance the training could be used to meet compliance requirements such as PCI 6.5.a. See Insecure.Inc curriculum document on mapping to SANS 25/ OWASP Top 10 / PCI 6.5

# Development Pre-requisites
Training portal
- Install VS Code (developed in 1.14)
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

# DB Setup Instructions
Install MySQL and create a DB and credentials for that DB. Note your user name and password you will need them for later.


# Encryption Key Seeds and Environment Variables
You will have to setup four seeds for encryption keys as OS environment variables. On *nix/mac modify .bash_profile as follows

export ENC_KEY="put something random here"
export ENC_KEY_IV="put something random here"
export CHALLENGE_KEY="put something random here"
export CHALLENGE_KEY_IV="put something random here"
export DOJO_DB_HOST="localhost"
export DOJO_URL="http://localhost:8081"
export DOJO_TARGET_URL="http://localhost:8080/InsecureInc"


# Dev Setup Instructions
Training portal
- Change directory to ./trainingportal
- Run npm install (to download all necessary dependencies)
- Open VSCode and open the repository directory
- To download all the required node packages change directory to  ./trainingportal and run npm install
- Copy ./trainingportal/config.js.sample to ./trainingportal/config.js
- Copy ./trainingportal/challengeSecrets.json.sample to ./trainingportal/challengeSecrets.json
- Copy ./insecureinc/src/inc/insecure/code.properties.sample to ./insecureinc/src/inc/insecure/code.properties
- Open ./trainingportal/encryptConfigs.js fill in db password etc and debug the script to generate encrypted configuration settings
- Copy the console output to each corresponding file
- Delete passwords from the encryptConfigs.js
NOTE: Google authentication is also available but commented out, see server.js if you want to enable it instead and encrypt google pass correspondingly 
- Open server.js and run it (at the first run the DB tables will get created)
- The trainingportal server will be running on http://localhost:8081/ 

Insecure.Inc
- Add a Tomcat 8.0 server you have installed
- Import the insecureinc project into your Workspace (Import > Import > Existing Projects into Workspace)
- Debug on server
- The Insecure.Inc website will be running on http://localhost:8080/InsecureInc

#Building

Training portal - NA
Insecure.Inc 
- Right click on the project to export as a .war file and import it on your Java EE server


#Hosting Insecure.Inc
Setup a Tomcat 8 server. Tomcat will ignore environment variables so you will have to configure the challenge key in /opt/tomcat/bin/setenv.sh
(or wherever you had tomcat installed) like so:

export CHALLENGE_KEY="our challenge key seed"
export CHALLENGE_KEY_IV="your challenge key iv seed"

Note: Don't put Insecure.Inc on a publicly facing server or in AWS since activity against it may trigger IPS alarms, etc. 

#Deploying the Training Portal on AWS ELB
AWS ELB setup is pretty standard. Configure the RDS DB separately because once you setup the environment you can't easily switch or delete databases.

Training portal
- Setup the RDS DB and credentials first
    * Use the encryptConfigs.js script to generate new encrypted db password config.js if different then your local environment
- Create an ELB environment using node
- When creating the environment choose to define environment variables as below

ENC_KEY="your enc key seed"
ENC_KEY_IV="your enc iv seed"
CHALLENGE_KEY="your challenge key seed"
CHALLENGE_KEY_IV="your challenge key iv seed"
DOJO_DB_HOST="your AWS RDS mysql host"
DOJO_URL="https://elburl"
DOJO_TARGET_URL="http://internalhost:8080/InsecureInc"


#Extending the Secure Coding Dojo
Challenges are defined in ./trainingportal/static/challenges
The file challengeDefinitions.json points to the corresponding html challenge description, play link and corresponding code blocks.
Follow the already defined examples to create a new one.

Code Blocks are defined in  ./trainingportal/static/codeBlocks. This folder has a similar structure with a definition json and a bunch of html files for each challenge.

Challenge codes
Simply add a new challenge code line in challengeSecrets.json and use the sample code in encryptConfigs.js to encrypt it
You can create a new jsp in the Insecure.Inc app by copying an existing one, make the challenges harder or slightly modify them or create your own site.
See how the codes are hashed and salted for transmission to the training portal leaderboard in Java Resources > src > inc.insecure > GetCode.java






