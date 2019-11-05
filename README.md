# About the Secure Coding Dojo
The Secure Coding Dojo is a platform for delivering secure coding training. 
While it comes with its own vulnerable training application (the Insecure.Inc website) the training portal can be used in conjunction with other  training applications.
The strength of the platform is its extensibility and the integration with the commonly used development collaboration platform Slack.
The training portal can be easily setup in the cloud and instructions for AWS Elastic Beanstalk setup are available below.

Be sure to also check the [wiki](https://github.com/trendmicro/SecureCodingDojo/wiki) for more details on deploying and installing the Dojo.

# Demo

Download the [demo](https://github.com/trendmicro/SecureCodingDojo/blob/master/demo/Secure%20Coding%20Dojo%20Demo.mp4) to get a look and feel of the training portal and the Insecure.Inc application.

Also take a look in /screenshots
![Alt text](/screenshots/frontpage.png?raw=true "Secure Coding Dojo Training Portal Front Page")

# Try it

The following steps will get you the basic configuration for the Dojo. For advanced configuration and integrations check the [wiki](https://github.com/trendmicro/SecureCodingDojo/wiki/Deploying-with-Docker)

- Install Docker latest version.
- Git clone the repository
- Change directory to the repo root directory
- Configure an environment variable DATA_DIR as a mount point for the dojo files. On *nix/mac modify .bash_profile as follows

    `export DATA_DIR="/YOUR_DATA_DIR"`

- On Mac you must allow Docker access to this directory in Docker > Preferences > File Sharing
- Restart your terminal
- Run with

    `docker-compose up`

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
- Install VS Code 
- node/npm (developed with v10)
- OPTIONAL: MySQL server + My SQL Workbench (developed with MySQL 5.7)

Insecure.Inc
- Developed in Java EE
- Eclipse Java EE latest version (developed with Neon) + Java 1.8 + tomcat 8 for the Insecure.Inc training app


# Slack Setup Instructions
You will need to create a Slack app for authentication.
- Go to https://api.slack.com/
- Hit Start Building and follow the prompts to create a Slack App in your Development Slack Team
- Once your app is created you will be able to get your App Credentials to configure your config.json
- Configure redirect urls under OAuth & Permissions. For example for a localhost setup the redirect url would be: http://localhost:8081/public/slack/callback


# Google Setup Instructions
Google authentication can also be configured in config.json. You will need a Google developer account and obtain the OAuth credentials from the Google API console: https://console.developers.google.com

In the same place you will setup your domain and authorized redirect URIs. For example for a localhost setup the redirect url would be: http://localhost:8081/public/google/callback

# Local Authentication Setup Instructions
For small teams or pre-configured images Slack or Google authentication may not be an option. For this scenario you can configure authentication working with a local flat file.

Check the wiki for more informations.

- Copy localUsers.json.sample to localUsers.json
- Add the line in config.json which specifies the localUsersPath
- There are several caveats with local authentication such as missing account lockout, password expiration etc.

# DB Setup Instructions

If you don't configure a DB the training portal will just use a local SQLite DB

You can also install MySQL and create a DB and credentials for that DB. Note your user name and password you will need them for later.

# Encryption Key Seeds and Environment Variables
You will have to setup encryption keys as OS environment variables. On *nix/mac modify .bash_profile as follows

    export ENC_KEY="put something random here"
    export ENC_KEY_IV="put something random here"

The following is to prevent participants from generating their own challenge codes.

    export CHALLENGE_MASTER_SALT="put something random here"


# Environment Setup Instructions
Training portal
- Change directory to ./trainingportal
- Run npm install (to download all necessary dependencies)
- Open VSCode and open the repository directory
- To download all the required node packages change directory to  ./trainingportal and run npm install
- Copy ./trainingportal/config.json.sample to ./trainingportal/config.json
- Open ./trainingportal/server.js and debug it in VSCode (at the first run the DB tables will get created)
- The trainingportal server will be running on http://localhost:8081/ 
- Run tests with `npm test`

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


# Hosting Insecure.Inc

Check out the [wiki](https://github.com/trendmicro/SecureCodingDojo/wiki/Running-Insecure.Inc).

# Deploying the Training Portal 

More info on the [wiki](https://github.com/trendmicro/SecureCodingDojo/wiki/Running-the-training-portal).

# Extending the Secure Coding Dojo
You can add new lessons by following the model of existing ones.

## Challenges 
Challenges are defined in ./trainingportal/static/lessons
The file definitions.json points to the corresponding html challenge description, play link and corresponding code blocks by code block id.
Follow the already defined examples to create a new one.

    .
    +-- /trainingportal/static/lessons
    |   +-- modules.json //configuration file where lesson modules are defined
    |   +-- /attack-grams //visual representations of attacks included in challenge descriptions
    |   +-- /blackBelt //lesson module
    |       +--definitions.json //individual lesson definitions
    |       +--cwe494.md // html or markdown file including the lesson description
    |       +--cwe494.sol.md //solution for the lesson
    |       ....
    |       +--quiz.html 
    |   +-- /secondDegreeBlackBelt


## Code Blocks 
Code Blocks are defined in  ./trainingportal/static/codeBlocks. This folder has a similar structure with a definition json and a bunch of html files for each challenge.

    .
    +-- /trainingportal/static/codeBlocks
    |   +-- codeBlocksDefinitions.json //configuration file where code blocks are defined
    |   +-- authenticationByDefault.html //code block description html
    |   ...
    |   +-- useStrongDataEncryption.html 







