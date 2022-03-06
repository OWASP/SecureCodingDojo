echo "Setting up basic dojo config for the first time"
mkdir ~/dojofiles
echo "export DATA_DIR=~/dojofiles" >> ~/.bash_profile
echo "export CHALLENGE_MASTER_SALT=$(openssl rand -hex 32)" >> ~/.bash_profile
cp build/trainingportal/config.json ~/dojofiles/config.json
chmod +x ./run-basic.sh
./run-basic.sh