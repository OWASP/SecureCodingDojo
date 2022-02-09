#!/bin/bash
DATA_DIR="/home/${USER}/SecureCodingDojo/secdata"
echo "export DATA_DIR=${DATA_DIR}" >> ~/.bash_profile


sudo yum install nodejs

cd ~/SecureCodingDojo/trainingportal/

npm install
npm audit fix
