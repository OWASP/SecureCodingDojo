# Running a Secure Coding Workshop using the Dojo

Bringing Software Security training to schools can have a positive impact on the security of future software. 
The Secure Coding Dojo project was created to bring knowledge about software weaknesses and security best practices to classrooms of all sizes: from universities to large companies. This workshop package is intended to facilitate security advocates to deliver training sessions using the dojo.

The workshop package is based on an event organized by the OWASP Ottawa Chapter and Secure that Cert at the University of Ottawa. Special thanks to the workshop organizers: Nancy Gariche, Garth Boyd, Miguel Garzon, Abdulwahaab Ahmed, Scott Kelly and Dave Petrasovic.


# Package Contents

The following resources are being provided with the package:
- Prerequisites
- Suggested agenda and workshop structure
- Presentation material
- Recording of a lecture at the University of Ottawa using the presentation material
- Dojo deployment instructions

# Prerequisites

Students will be asked to bring the following:
- Laptop with Internet access 
- Optional: Docker and latest version of the Secure Coding Dojo per the install instructions below.
- Browser: Chrome or Firefox latest version
- No other software is required.

Organizers should consider the following:
- Event planning platform
- Room size based on registration
- AV and Internet access for participants
- Consider hosting for the Secure Coding Dojo platform: cloud account, host names, certificates
- Workshop staff. 1 tutor to 50 students. Workshop staff should complete all exercises in advance and be familiar with the content.
- Catering if applicable


# Suggested Agenda

The following agenda is based on a full day workshop including lecture.

- 10:00 Registration
- 10:30 Lecture: Attack-Grams
- 11:00 Lecture: Secure Coding Practices
- 12:00 Lunch break
- 12:30 Dojo Practice Setup, Accounts, Urls
- 13:00 Dojo Practice: Security Code Review Master Module
- 13:30 Dojo Practice: Secure Coding Dojo Black Belt Module
- 17:00 End of workshop

# Presentation Material

Slides for the lecture portion are available in this folder and can be distributed under the licensing of this project.
Please give credit to the content creator and graphics creators.

# Lecture Recording

A lecture recording using the provided presentation material can be found at the following [link](https://www.youtube.com/watch?v=1ghIH_Myu4U&feature=youtu.be&t=929)

# Deploying Secure Coding Dojo

The Secure Coding Dojo runs from Docker containers. Students could easily deploy their own instance using docker-compose as described below. 
Deploying a common permanent production instance of the Dojo requires a bit more setup with instructions available on the [wiki](https://github.com/trendmicro/SecureCodingDojo/wiki/Deploying-with-Docker) .

You may also find useful the AppSec DC 2019 presentation of the project: [AppSeC Presentation](https://github.com/trendmicro/SecureCodingDojo/tree/master/AppSecDC%20Secure%20Coding%20Dojo%20Presentation)

Costs for a permanent deployment may vary from $30/m to more depending on the number of participants.

## Basic Setup

- Install Docker latest version.
- Git clone the repository
- Change directory to the repo root directory
- Configure an environment variable DATA_DIR as a mount point for the dojo files. On *nix/mac modify .bash_profile as follows

    `export DATA_DIR="/YOUR_DATA_DIR"`

- On Mac you must allow Docker access to this directory in Docker > Preferences > File Sharing
- Restart your terminal
- Run with

    `docker-compose up`





