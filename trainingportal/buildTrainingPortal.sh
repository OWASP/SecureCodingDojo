set -o errexit
npm test
npm install
npm rebuild
cp prod.config.js config.js;
rm -f ../build/trainingportal/*.zip
zip ../build/trainingportal/SCD-"$(date)".DOCKER.zip -r *.js *.sql \
 package-lock.json package.json public/* static/* sql/* \
 -x "*.DS_Store" -x "encryptConfigs.js" -x "decrypt.js" -x "*.config.js" -x "config.js";
rm -f *.zip 
zip SCD-"$(date)".AWS.zip -r *.js *.sql \
 .ebextensions/* \
 node_modules/* public/* static/* sql/*  \
 -x "*.DS_Store" -x "encryptConfigs.js" -x "decrypt.js" -x "*.config.js";
cp dev.config.js config.js