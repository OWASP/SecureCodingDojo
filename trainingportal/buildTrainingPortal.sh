set -o errexit
npm test
cp prod.config.js config.js;
rm -f ../build/trainingportal/*.zip
zip ../build/trainingportal/SCD-AWSBuild-"$(date)".zip -r .ebextensions/* *.js *.sql \
 node_modules/* package-lock.json package.json public/* static/* challengeSecrets.json \
 -x "*.DS_Store" -x "encryptConfigs.js" -x "*.config.js";
cp dev.config.js config.js