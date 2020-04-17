echo
echo "== Secure Coding Dojo - Training Portal Dev Setup Script =="
echo "1. Installing npm modules and updating dependencies..."
npm install
npm audit fix
echo
echo "2.Applying basic configuration (see config.json.sample for more options)"
cp ../build/trainingportal/config.json config.json
echo
echo "3.Setting up a local database and local user"
node tools/devSetup.js
echo
echo "4.Running tests"
npm test

echo "Open server.js and debug with F5. Login with 'dojouser/SecureCodingDojo'"
