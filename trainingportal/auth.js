const path = require('path');
const util = require(path.join(__dirname, 'util'));
const config = util.getConfig();
const crypto = require('crypto');
const aesCrypto = require(path.join(__dirname, 'aescrypto'));
const session = require('express-session');
const passport = require('passport');
const validator = require('validator');
const uid = require('uid-safe');

const db = require(path.join(__dirname, 'db'));
const challenges = require(path.join(__dirname, 'challenges'));
const captchapng = require('captchapng');
const fs = require('fs');




if(!util.isNullOrUndefined(config.samlProviderCertFilePath)){
    var samlProviderCert = fs.readFileSync(path.join(__dirname, config.samlProviderCertFilePath), 'utf-8');
} 
if(!util.isNullOrUndefined(config.encSamlProviderPvkFilePath)){
    var encSamlProviderPvk = fs.readFileSync(path.join(__dirname, config.encSamlProviderPvkFilePath), 'utf-8');
    var samlProviderPvk = aesCrypto.decrypt(encSamlProviderPvk);
} 


var localUsers = null;
var localUsersPath = "";
try{
  if(!util.isNullOrUndefined(config.localUsersPath))
  {
    let dataDir = util.getDataDir();
    localUsersPath = path.join(dataDir, config.localUsersPath);
    
    if(!fs.existsSync(localUsersPath)){
        //create the users file if not already there
        fs.writeFileSync(localUsersPath, "{}", 'utf8');
    }
    localUsers = require(localUsersPath);
  }
}
catch(ex){
    util.log(ex);
}


var allowedAccounts = null;
try{
    if(!util.isNullOrUndefined(config.allowedAccounts)){
        allowedAccounts = require(path.join(__dirname, config.allowedAccounts));
    }
}
catch(ex){/*Do nothing*/}


var GoogleStrategy = require('passport-google-oauth20').Strategy;
var SlackStrategy = require('passport-slack').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var SamlStrategy = require('passport-saml').Strategy;
var LdapStrategy = require('passport-ldapauth').Strategy;

let isAuthenticated = function (req){
    return !util.isNullOrUndefined(req) && !util.isNullOrUndefined(req.user) && !util.isNullOrUndefined(req.user.id) && req.isAuthenticated();
}

let getCaptcha = function(req,res){
    
      var val = parseInt(Math.random()*9000+1000);
      
      var p = new captchapng(80,30,val); // width,height,numeric captcha 
      req.session.captcha=val.toString();
      req.session.save();
    
      p.color(0, 0, 0, 0);  
      p.color(80, 80, 80, 255); 
    
      var img = p.getBase64();
      var imgbase64 = new Buffer.from(img, 'Base64');
      res.writeHead(200, {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, must-revalidate'
      });
      res.end(imgbase64);
}

let isValidCaptcha = function(req,captcha){
    var vfyCatpcha = req.session.captcha;
    
    //clear the captcha 
    req.session.captcha = uid.sync(6);
    req.session.save();
    
    if(util.isNullOrUndefined(captcha) || vfyCatpcha !== captcha){
        return false;
    }

    return true;
}

let checkCaptchaOnLogin = function(req,res,next){
    var captcha = req.body.loginCaptcha;
    if(util.isNullOrUndefined(captcha)){
        util.log("Missing captcha on login request");
        return res.redirect("/public/authFail.html");
    }
    if(!isValidCaptcha(req, captcha)){
        util.log("Invalid captcha on login request");
        return res.redirect("/public/authFail.html");
    }
    next();
}


/**
 * Registers a user in the local directory
 * 
 */
let registerLocalUser = function(req,res){
    //check if local auth is enabled
    if(localUsers == null){
        return util.apiResponse(req, res, 400, "Local authentication is not enabled");
    }
    
    var newUser = req.body.newUser;

    if(util.isNullOrUndefined(newUser)){
        return util.apiResponse(req, res, 400, "Invalid request.'newUser' not defined.");
    }
    var username = newUser.username;
    if(util.isNullOrUndefined(username) || validator.isAlphanumeric(username,'en-US')===false){
        return util.apiResponse(req, res, 400, "Invalid username.");
    }

    if(username in localUsers){
        return util.apiResponse(req, res, 400, "Invalid username.");
    }

    var password = newUser.password;
    
    if(util.isNullOrUndefined(password)){
        return util.apiResponse(req, res, 400, "Invalid request. 'password' not defined.");
    }

    var givenName = newUser.givenName;
    if(util.isNullOrUndefined(givenName) || validator.matches(givenName,/^[A-Z'\-\s]+$/i)===false){
        return util.apiResponse(req, res, 400, "Invalid givenName.");
    }
    var familyName = newUser.familyName;
    if(util.isNullOrUndefined(familyName) || validator.matches(familyName,/^[A-Z'\-\s]+$/i)===false){
        return util.apiResponse(req, res, 400, "Invalid familyName.");
    }

    var captcha = newUser.captcha;
    if(!isValidCaptcha(req,captcha)){
        return util.apiResponse(req, res, 400, "Invalid captcha.");
    }

    var localUser = {"givenName":givenName,"familyName":familyName};

    createUpdateUser(req, res, username, localUser, password);
    
};


let createUpdateUserInternal = (username, localUser, password) => {
  //create user
  localUser.passSalt = crypto.randomBytes(16).toString('base64').toString();
  localUser.passHash = util.hashPassword(password,localUser.passSalt);

  localUsers[username] = localUser;
  //save to disk
  var json = JSON.stringify(localUsers, null, "\t");
  fs.writeFileSync(localUsersPath, json, 'utf8');
};

let createUpdateUser = function(req, res, username, localUser, password){
    
    var isStrongPass = validator.matches(password,/.{16,}/)==true &&
    validator.matches(password,/[a-z]/)==true;

    if(!isStrongPass){
        return util.apiResponse(req, res, 400, "Select a password that is made up from three or more words (16 or more characters)");
    }

    createUpdateUserInternal(username, localUser, password);
  
    return util.apiResponse(req, res, 200, "User created/modified.");
};


let verifyLocalUserPassword = function(username,password){
    if(localUsers === null){
        util.log("Local authentication is not configured"); 
        return null;
   } 

   if(username in localUsers){
        var user = localUsers[username];
        var saltString =user.passSalt ;

        var passwordHash = util.hashPassword(password,saltString);
        if(user.passHash === passwordHash){
            return user;
        }
        else{
            util.log("Authentication failure for user: "+username);
        }
   }
   else{
        util.log("User '"+username+"' not found.");
   }

   return null;
}

let updateLocalUser = function(req,res){
    //check if local auth is enabled
    if(localUsers === null){
        return util.apiResponse(req, res, 400, "Local authentication is not enabled");
    }

    if(util.isNullOrUndefined(req.user)){
        return util.apiResponse(req, res, 500, "Inconsistent session state");
    }

    if(req.user.accountId.indexOf("Local_") !== 0){
        return util.apiResponse(req, res, 400, "Current user not a local user");
    }

    var username = req.user.accountId.substring("Local_".length);
    var localUser = localUsers[username];

    if(util.isNullOrUndefined(localUser)){
        return util.apiResponse(req, res, 400, "Current user not in local users");
    }

    var profileInfo = req.body.profileInfo;

    if(util.isNullOrUndefined(profileInfo)){
        return util.apiResponse(req, res, 400, "Invalid request.'profileInfo' not defined.");
    }

    var curPassword = profileInfo.curPassword;
    
    if(util.isNullOrUndefined(curPassword)){
        return util.apiResponse(req, res, 400, "Invalid request. 'curPassword' not defined.");
    }

    var newPassword = profileInfo.newPassword;
    
    if(util.isNullOrUndefined(newPassword)){
        return util.apiResponse(req, res, 400, "Invalid request. 'newPassword' not defined.");
    }

    if(verifyLocalUserPassword(username,curPassword)===null){
        return util.apiResponse(req, res, 400, "Current password doesn't match or user does not exist.");
    }

    createUpdateUser(req, res, username, localUser, newPassword);

}


let processAuthCallback = async(profileId, givenName, familyName, email, cb) => {
    //if allowed account pattern or an allowed list of accounts are not configured all users are allowed
    var isAllowed = util.isNullOrUndefined(config.allowedAccountPattern) && allowedAccounts===null;
    //check the allowed pattern if defined
    if(!isAllowed && !util.isNullOrUndefined(config.allowedAccountPattern)) isAllowed = profileId.match(new RegExp(config.allowedAccountPattern));
    //check the allowed accounts are defined
    if(!isAllowed && allowedAccounts!==null) isAllowed = allowedAccounts.indexOf(profileId) > -1;
    //if still not allowed stop here
    if(!isAllowed){
        util.log("Profile id not allowed:"+profileId);
        return cb(new Error("Profile id not allowed:"+profileId));
    }
    try {
        let user = await db.getPromise(db.getUser, profileId);
        if(user){
            //the user exists return this user
            user.email = email;
            let modules = challenges.getModules();
            for(let moduleId in modules){
                let promise = challenges.verifyModuleCompletion(user, moduleId);
                promise.catch((err) => {
                    util.log("Error with badge verification.", user);
                });
            }
        }
        else{
            //get team id
            let teamId = null;
            if(config.defaultTeam){
                let team = await db.getPromise(db.getTeamWithMembersByName, config.defaultTeam);
                if(team){
                    teamId = team.id;
                }
                else{
                    util.log("WARN: Could not find configured default team. Defaulting to no assigned team");
                }
            }

            //create a new user profile in the database
            user = {
                accountId: profileId, 
                familyName: familyName, 
                givenName: givenName,
                teamId: teamId,
                level:0
            };
            await db.getPromise(db.insertUser, user);
            user = await db.getPromise(db.getUser, profileId);
            if(user){
                util.log("New user created.", user);
                user.email = email;
            }
            else{
                cb(new Error("Failed to create user"));
            }
        }
        if(cb) return cb(null, user);
        
    } catch (error) {
        util.log(error);
        cb(error, null);
    }
}

//Returns the google strategy settings
let getLocalStrategy = function () {
    return new LocalStrategy((username, password, cb) => {
        var user = verifyLocalUserPassword(username, password)
        if(user!==null){
            return processAuthCallback("Local_"+username, user.givenName, user.familyName, null, cb);
        }
        
        return cb(null,false);

    });
}

//Returns the LDAP Strategy
let getLdapStrategy = function () {
    config.ldapServer.bindCredentials = aesCrypto.decrypt(config.ldapServer.encBindCredentials);
    if(!util.isNullOrUndefined(config.ldapServer.caCertPath)){
        config.ldapServer.tlsOptions = {
            ca: [
                fs.readFileSync(path.join(__dirname, config.ldapServer.caCertPath),'utf8')
            ]
          }
    }
    return new LdapStrategy({
            server: config.ldapServer
        },
    (user, cb) => {
    
        if(user!==null){
            var splitName = user.name.split(" ");
            var givenName = "";
            var familyName = "";
            var email = user.email;


            if(splitName.length >= 1) givenName = splitName[0];
            if(splitName.length >= 2) familyName = splitName[1];

            return processAuthCallback("LDAP_"+user.cn, givenName, familyName, email, cb);
        }
        
        return cb(null,false);

    });
}

//Returns the google strategy settings
let getGoogleStrategy = function () {
    return new GoogleStrategy({
        clientID: config.googleClientId,
        clientSecret: aesCrypto.decrypt(config.encGoogleClientSecret),
        callbackURL: config.dojoUrl+"/public/google/callback"
    }, (accessToken, refreshToken, profile, cb) => {
        var email = null;
        if(profile.emails !== null && profile.emails.length > 0){
            //use the first e-mail in the list
            email = profile.emails[0].value;
        }
        return processAuthCallback(profile.id, profile.name.givenName, profile.name.familyName, email, cb);
    });
}

let getSamlStrategy = function () {
    return new SamlStrategy({
        entryPoint: config.samlEntryPoint,
        issuer: config.samlCallbackUrl,
        callbackUrl: config.dojoUrl+"/public/saml/callback",
        acceptedClockSkewMs: 5*60*1000,
        authnRequestBinding : 'HTTP-POST',
        skipRequestCompression: true,
        signatureAlgorithm: 'sha256',
        cert: config.samlCert,
        decryptionPvk: samlProviderPvk,
        privateCert: samlProviderPvk,
        authnContext: 'http://schemas.microsoft.com/ws/2008/06/identity/authenticationmethod/windows',
        identifierFormat: null
      }, (user, cb) => {
            if(user!==null){
               
                var givenName = user[config.samlGivenName];
                var familyName = user[config.samlFamilyName];
                var email = user[config.samlEmail];

                return processAuthCallback("SAML_"+email, givenName, familyName, email, cb);
            }
            
            return cb(null,false);
    });
}


//Returns the google strategy settings
let getSlackStrategy = function () {
    return new SlackStrategy({
        clientID: config.slackClientId,
        clientSecret: aesCrypto.decrypt(config.encSlackClientSecret),
        callbackURL: config.dojoUrl+"/public/slack/callback",
        tokenURL: config.slackTokenURL,
        authorizationURL: config.slackAuthorizationURL,
        scope:'identity.basic identity.email'
    }, (accessToken, refreshToken, profile, cb) => {
        if(typeof profile.user!=='undefined'){
            var splitName = profile.user.name.split(" ");
            var givenName = "";
            var familyName = "";
            var email = profile.user.email;
            if(profile.team.id !== config.slackTeamId){
            util.log("Invalid team id");
            return cb();  
            } 

            if(splitName.length >= 1) givenName = splitName[0];
            if(splitName.length >= 2) familyName = splitName[1];

            return processAuthCallback(profile.id, givenName, familyName, email, cb);
        }
        else{
            //some error occured
            util.log("Slack authentication error occurred.");
            util.log(err);
             if(cb) return cb(profile);
        }
    });
}


//init passport
let getPassport = function (){
    if("googleClientId" in config) passport.use(getGoogleStrategy());
    if("slackClientId" in config) passport.use(getSlackStrategy());
    if("localUsersPath" in config) passport.use(getLocalStrategy());
    if("ldapServer" in config) passport.use(getLdapStrategy());

    
    if("samlCert" in config){ 
        var samlStrategy = getSamlStrategy();
        if(config.samlLogProviderMetadata){
            console.log(samlStrategy.generateServiceProviderMetadata(samlProviderCert));
        }
        passport.use(getSamlStrategy());
    }

    // serialize and deserialize
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });
    return passport;
}


//Returns a session object
let getSession = function () {
    var ses = session(
    { 
        proxy:true,
        secret: uid.sync(64), 
        resave:false, 
        saveUninitialized:false,
        maxAge: Date.now() + 1000 * 60 * 60 * 2, //2 hours session timeout
        cookie: {secure:config.dojoUrl.startsWith("https")} 
    });

    return ses;

}



//test authentication
let ensureAuthSkipXsrfCheck = function (req, res, next) {
    if (isAuthenticated(req)) { 
      next(); 
    }
    else{
        if(typeof req.session !== 'undefined' && req.session){
            req.session.destroy(() => {
                res.redirect('/');
            });
        }
        else{
            res.redirect('/');
        }

    }
}

//add csrf token
let addCsrfToken = function (req, responseBody){
    if(typeof req.session.xsrfToken === 'undefined'){ //generate a new token if hasn't been created yet
        req.session.xsrfToken = uid.sync(64);
    }
    if(isAuthenticated(req)){
        responseBody = responseBody.replace("%XSRF_TOKEN%", req.session.xsrfToken);
    }
    return responseBody;
}


let authenticationByDefault = function (req, res, next) {
    //the root folder and the public folder are the only ones excluded from authentication
    if (req.path === "/" || req.path.indexOf('/public') === 0 || req.path.indexOf('/favicon.ico') === 0 ){ 
        next();
    }
    else if(req.path.indexOf('/api') === 0){ 
        //api auth is stronger and has XSRF protection
        ensureApiAuth(req,res,next);
    }
    else{ 
        //everything else uses cookie authentication
        ensureAuthSkipXsrfCheck(req,res,next);
    }

}

//test authentication with xsrf token
let ensureApiAuth = function (req, res, next) {
  let isAuth= isAuthenticated(req) && typeof req.headers.xsrftoken !== 'undefined' && req.headers.xsrftoken === req.session.xsrfToken;

  if(isAuth){
    return next();
  }
  
  util.apiResponse(req, res,401,"Unauthorized");

}

//logs the user out and kills the session
let logoutAndKillSession = function (req, res, redirect){
    req.logout();
    req.session.destroy(() => {
        res.redirect(redirect);
    }); 
}

//logout
let logout = function (req, res) {
  logoutAndKillSession(req, res, '/');
}

//prevent the browser from caching authenticated pages
let addSecurityHeaders = function (req, res, next) {
    if(req.path.indexOf("/public") !== 0 && req.path !== "/"){
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
           
    }
    res.header('Content-Security-Policy', "script-src 'self' 'unsafe-inline' 'unsafe-eval';");
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('X-XSS-Protection', '1');
    res.header('Strict-Transport-Security', 'max-age=31536000');
    res.header('X-Content-Type-Options', 'nosniff'); 

    next();
}

module.exports = {
    addCsrfToken,
    addSecurityHeaders,
    authenticationByDefault,
    checkCaptchaOnLogin,
    createUpdateUserInternal,
    ensureApiAuth,
    getCaptcha,
    getPassport,
    getSession,
    logout,
    logoutAndKillSession,
    processAuthCallback,
    registerLocalUser,
    updateLocalUser
}