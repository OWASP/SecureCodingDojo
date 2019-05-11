var config = {};
config.dojoUrl = process.env.DOJO_URL;
config.dojoTargetUrl = process.env.DOJO_TARGET_URL;
config.isSecure = config.dojoUrl.startsWith("https");
//for those cases when absolute links are specific to your environment
config.playLinks = [{"challengeid":"links"}];

//account id whitelisting rules, if undefined all accounts are allowed
config.allowedAccountPattern = /^Local_/; //use in conjunction with account whitelist to enable accounts matching the pattern e.g. Local_

config.dataDir = process.env.DATA_DIR; //use to specify where the local db or the local users will be stored

config.localUsersPath = 'localUsers.json';//authentication using a password file containing users and hashed passwords, no lockout

module.exports = config;

