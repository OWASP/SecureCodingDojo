set -o errexit
npm test
cp prod.config.js config.js;
zip SCD-AWSBuild-"$(date)".zip -r .ebextensions/* accountWhitelist.json aescrypto.js auth.js challenges.js \
challengeSecrets.json config.js db.js node_modules/* package-lock.json package.json public/* static/* \
 server.js util.js -x "*.DS_Store";
cp dev.config.js config.js