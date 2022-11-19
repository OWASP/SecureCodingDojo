set -o errexit
npm test

#include here your own test tools
if [ -f "runCustomTestScripts.sh" ]
then
    ./runCustomTestScripts.sh
fi

rm -f ../build/trainingportal/*.zip
zip ../build/trainingportal/SCD-"$(date)".DOCKER.zip -rq *.js *.sql \
 package-lock.json package.json public/* static/* sql/* \
 -x "*.DS_Store" -x "encryptConfigs.js" -x "decrypt.js" -x "*.config.js" -x "config.json";

docker build -t securecodingdojo/trainingportal ../build/trainingportal/
