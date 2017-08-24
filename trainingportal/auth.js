const path = require('path');
const config = require(path.join(__dirname, 'config'));
const aesCrypto = require(path.join(__dirname, 'aescrypto'));
const session = require('express-session');
const passport = require('passport');
const uid = require('uid-safe');

const db = require(path.join(__dirname, 'db'));
const util = require(path.join(__dirname, 'util'));

var GoogleStrategy = require('passport-google-oauth20').Strategy;
var SlackStrategy = require('passport-slack').Strategy;


exports.isAuthenticated = function (req){
    return !util.isNullOrUndefined(req) && !util.isNullOrUndefined(req.user) && !util.isNullOrUndefined(req.user.id) && req.isAuthenticated();
}

processAuthCallback = function (profileId, givenName, familyName, cb) {
    //try to get a user from the database
    db.getUser(profileId, null, (user) => {
    if(user){
        //the user exists return this user
        util.log("User logged in.", user);
        if(cb) return cb(null, user);
    }
    else{

        //create a new user profile in the database
        user = {
            accountId: profileId, 
            familyName: familyName, 
            givenName: givenName,
            teamId: null,
            level:0
        };
        db.insertUser(user, null, function(){
            //on success retrive the user record to store it into the session
            db.getUser(profileId, null, (user) => {
                util.log("New user created.", user);
                if(cb) return cb(null, user);
            });
        })
    }
    });

}

//Returns the google strategy settings
getGoogleStrategy = function () {
    return new GoogleStrategy({
        clientID: config.googleClientId,
        clientSecret: aesCrypto.decrypt(config.encGoogleClientSecret),
        callbackURL: config.googleOauthCallbackUrl
    }, (accessToken, refreshToken, profile, cb) => {
        processAuthCallback(profile.id, profile.name.givenName, profile.name.familyName, cb);
    });
}

//Returns the google strategy settings
getSlackStrategy = function () {
    return new SlackStrategy({
        clientID: config.slackClientId,
        clientSecret: aesCrypto.decrypt(config.encSlackClientSecret),
        callbackURL: config.slackOauthCallbackUrl,
        scope:'identity.basic'
    }, (accessToken, refreshToken, profile, cb) => {
        if(typeof profile.user!=='undefined'){
            var splitName = profile.user.name.split(" ");
            var givenName = "";
            var familyName = "";

            if(profile.team.id !== config.slackTeamId){
            util.log("Invalid team id");
            return cb();  
            } 

            if(splitName.length >= 1) givenName = splitName[0];
            if(splitName.length >= 2) familyName = splitName[1];

            processAuthCallback(profile.id, givenName, familyName, cb);
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
exports.getPassport = function (){
    //passport.use(getGoogleStrategy());
    passport.use(getSlackStrategy());

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
exports.getSession = function () {
    var ses = session(
    { 
        proxy:true,
        secret: aesCrypto.decrypt(config.encExpressSessionSecret), 
        resave:false, 
        saveUninitialized:false,
        cookie: {secure:config.isSecure} 
    });

    return ses;

}



//test authentication
exports.ensureAuthSkipXsrfCheck = function (req, res, next) {
    if (exports.isAuthenticated(req)) { 
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
exports.addCsrfToken = function (req, responseBody){
    if(typeof req.session.xsrfToken === 'undefined'){ //generate a new token if hasn't been created yet
        req.session.xsrfToken = uid.sync(64);
    }
    if(exports.isAuthenticated(req)){
        responseBody = responseBody.replace("%XSRF_TOKEN%", req.session.xsrfToken);
    }
    return responseBody;
}


exports.authenticationByDefault = function (req, res, next) {
    //the root folder and the public folder are the only ones excluded from authentication
    if (req.path === "/" || req.path.indexOf('/public') === 0){ 
        next();
    }
    else if(req.path.indexOf('/api') === 0){ 
        //api auth is stronger and has XSRF protection
        exports.ensureApiAuth(req,res,next);
    }
    else{ 
        //everything else uses cookie authentication
        exports.ensureAuthSkipXsrfCheck(req,res,next);
    }

}

//test authentication with xsrf token
exports.ensureApiAuth = function (req, res, next) {
  var isAuthenticated = exports.isAuthenticated(req) && typeof req.headers.xsrftoken !== 'undefined' && req.headers.xsrftoken === req.session.xsrfToken;

  if(isAuthenticated){
    return next();
  }
  
  util.apiResponse(req, res,401,"Unauthorized");

}

//logs the user out and kills the session
exports.logoutAndKillSession = function (req, res, redirect){
    req.logout();
    req.session.destroy(() => {
        res.redirect(redirect);
    }); 
}

//logout
exports.logout = function (req, res) {
  exports.logoutAndKillSession(req, res, '/');
}

//prevent the browser from caching authenticated pages
exports.addSecurityHeaders = function (req, res, next) {
    if(req.path.indexOf("/public") !== 0 && req.path !== "/"){
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        
    }
    res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';");
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('Strict-Transport-Security', 'max-age=31536000');

    next();
}
