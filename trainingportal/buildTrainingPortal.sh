set -o errexit
npm test
npm install
npm rebuild

rm -f ../build/trainingportal/*.zip
zip ../build/trainingportal/SCD-"$(date)".DOCKER.zip -r *.js *.sql \
 package-lock.json package.json public/* static/* sql/* \
 -x "*.DS_Store" -x "encryptConfigs.js" -x "decrypt.js" -x "*.config.js" -x "config.json";

docker build -t securecodingdojo/trainingportal ../build/trainingportal/

rm -f *.zip 
cp prod.config.json config.json;
zip SCD-"$(date)".AWS.zip -r *.js config.json *.sql \
 .ebextensions/* \
 node_modules/* public/* static/* sql/*  \
 -x "*.DS_Store" -x "encryptConfigs.js" -x "decrypt.js" -x "*.config.js" -x "*.config.json" ;
rm -f config.json