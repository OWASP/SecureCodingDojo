zip SCD-AWSBuild-"$(date)".zip -r .ebextensions/* accountWhitelist.json aescrypto.js auth.js challenges.js \
challengeSecrets.json config.js db.js node_modules/* package-lock.json package.json public/* static/* SquadDirectory.csv \
 server.js util.js -x "*.DS_Store"