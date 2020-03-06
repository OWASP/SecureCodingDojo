/**

Copyright 2017-2018 Trend Micro

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this work except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 */
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const uid = require('uid-safe');
const validator = require('validator');

const db = require(path.join(__dirname, 'db'));
const auth = require(path.join(__dirname, 'auth'));
const util = require(path.join(__dirname, 'util'));
var config = util.getConfig();
const challenges = require(path.join(__dirname, 'challenges'));
const report = require(path.join(__dirname, 'report'));
var mainHtml = fs.readFileSync(path.join(__dirname, 'static/main.html'),'utf8');


//INIT
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser()); //lgtm [js/missing-token-validation]
app.use(auth.getSession());

const passport = auth.getPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(auth.authenticationByDefault);
app.use(auth.addSecurityHeaders);
app.use('/public/jquery',express.static(path.join(__dirname, 'node_modules/jquery')));
app.use('/public/angular',express.static(path.join(__dirname, 'node_modules/angular')));
app.use('/public/angular-route',express.static(path.join(__dirname, 'node_modules/angular-route')));
app.use('/public/bootstrap/dist/css/bootstrap.min.css',express.static(
  path.join(__dirname, 'node_modules/bootswatch/dist/darkly/bootstrap.min.css')));
app.use('/public/bootstrap',express.static(path.join(__dirname, 'node_modules/bootstrap')));
app.use('/public/open-iconic',express.static(path.join(__dirname, 'node_modules/open-iconic')));
app.use('/public/highlightjs',express.static(path.join(__dirname, 'node_modules/highlightjs')));

app.use('/public',express.static(path.join(__dirname, 'public')));


app.use('/static', (req, res, next) => {
    var result = req.url.match(/challengeDefinitions.json/);
    if (result) {
      return res.status(403).end('403 Forbidden');
    }
  next();
});

app.use('/static',express.static(path.join(__dirname, 'static')));

app.use(fileUpload({
  limits: { fileSize: 1 * 1024 * 1024 },
  safeFileNames: true
}));


//ROUTES

app.get("/",(req,res) => {
    res.redirect('/public/index.html');
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).send();
}); 


app.get("/public/privacy",(req,res) => {
  let html = util.getPrivacyHtml();
  if(html===null){
    res.status(204).send();
  }
  else{
    res.header("Content-type","text/html").send(html);
  }
});


app.get("/public/providers",(req,res) => {
  var providers = [];
  if("googleClientId" in config) providers.push({"name":"Google","url":"/public/provider/google"});
  if("slackClientId" in config) providers.push({"name":"Slack","url":"/public/provider/slack"});
  if("samlCert" in config) providers.push({"name":"ADFS SAML","url":"/public/provider/saml"});
  if("localUsersPath" in config) providers.push({"name":"Local","url":"/public/provider/local"});
  if("ldapServer" in config) providers.push({"name":"LDAP","url":"/public/provider/ldap"});

  res.send(providers);
});

app.get('/public/provider/:provider', (req,res) => {
  //invalidate any active session
  var redirect = '';
  if(req.params.provider == 'slack') redirect = '/public/slack';
  else if(req.params.provider == 'google') redirect = '/public/google';
  else if(req.params.provider == 'saml') redirect = '/public/saml';
  else if(req.params.provider == 'local') redirect = '/public/locallogin.html';
  else if(req.params.provider == 'ldap') redirect = '/public/ldaplogin.html';
  auth.logoutAndKillSession(req, res, redirect);
});


app.get("/public/captcha.png", auth.getCaptcha);

app.post("/public/register", auth.registerLocalUser);

//this one is an authenticated request because is under /api
app.post("/api/localUser/updateUser", auth.updateLocalUser);



app.get('/public/google',
  passport.authenticate('google', { scope: 
  	[ 'https://www.googleapis.com/auth/userinfo.email', 
      'https://www.googleapis.com/auth/userinfo.profile'] }
));

app.get( '/public/google/callback', passport.authenticate( 'google', { 
		successRedirect: '/main',
		failureRedirect: '/public/authFail.html'
}));


// path for slack auth
app.get('/public/slack', passport.authenticate('slack'));
 
// OAuth callback url 
app.get( '/public/slack/callback', passport.authenticate( 'slack', { 
		successRedirect: '/main',
		failureRedirect: '/public/authFail.html'
}));

// path for saml auth
app.get('/public/saml', (req, res) => {
  res.redirect(config.samlEntryPoint);
});
 
// saml callback url 
app.post( '/public/saml/callback', passport.authenticate( 'saml', { 
		successRedirect: '/main',
		failureRedirect: '/public/authFail.html'
}));
 

app.post('/public/locallogin', [
  auth.checkCaptchaOnLogin,
  passport.authenticate('local', { failureRedirect: '/public/authFail.html' })
],
function(req, res) {
  res.redirect('/main');
});

app.post('/public/ldaplogin', passport.authenticate('ldapauth', { failureRedirect: '/public/authFail.html' }),
function(req, res) {
  res.redirect('/main');
});

app.get("/public/authFailure",(req,res) => {
    res.send('Unable to login');
});

app.get('/logout', auth.logout);

app.get('/main', (req, res) => {
  let updatedHtml = auth.addCsrfToken(req, mainHtml);
  res.send(updatedHtml);
});


app.get('/challenges/:moduleId', async (req, res) => {
  var moduleId = req.params.moduleId;
  
  if(util.isNullOrUndefined(moduleId) || validator.isAlphanumeric(moduleId) == false){
    return util.apiResponse(req, res, 400, "Invalid module id."); 
  }

  let allowed = await challenges.isPermittedModule(req.user, moduleId);

  if(!allowed){
    return util.apiResponse(req, res, 403, "Requested module id is not available."); 
  }

  var returnChallenges = await challenges.getChallengeDefinitionsForUser(req.user, moduleId);
  var response = {
    "challenges" : returnChallenges
  };

  if(!util.isNullOrUndefined(config.moduleUrls[moduleId])){
    response.targetUrl = config.moduleUrls[moduleId];
  }
  res.send(response);
});

app.get('/api/modules', async (req, res) => {
  var modules = challenges.getModules();
  res.send(modules);
});

app.get('/challenges/:moduleId/level', async (req, res) => {
  var moduleId = req.params.moduleId;
  
  if(util.isNullOrUndefined(moduleId) || validator.isAlphanumeric(moduleId) == false){
    return util.apiResponse(req, res, 400, "Invalid module id."); 
  }

  let userLevelForModule = await challenges.getUserLevelForModule(req.user, moduleId);

  res.send({"level":userLevelForModule});
});

app.get('/challenges/solutions/:challengeId', (req,res) => {
  var challengeId = req.params.challengeId;
  if(util.isNullOrUndefined(challengeId) || util.isAlphanumericOrUnderscore(challengeId) === false){
    return util.apiResponse(req, res, 400, "Invalid challenge id."); 
  }
  var solutionHtml = challenges.getSolution(challengeId);
  res.send(solutionHtml);
});


app.get('/challenges/descriptions/:challengeId', (req,res) => {
  var challengeId = req.params.challengeId;
  if(util.isNullOrUndefined(challengeId) || util.isAlphanumericOrUnderscore(challengeId) === false){
    return util.apiResponse(req, res, 400, "Invalid challenge id."); 
  }
  var descriptionHtml = challenges.getDescription(challengeId);
  res.send(descriptionHtml);
});


app.get('/api/user', (req, res) => {
   db.fetchChallengeEntriesForUser(req.user,function(){
      res.send(req.user);
  },function(entries){
      var passedChallenges = [];
      if(entries!=null){
        passedChallenges = entries;
      }
      req.user.passedChallenges = passedChallenges;
      res.send(req.user);
  });
});


app.get('/api/user/badges', async (req, res) => {
  let badges = await db.fetchBadges(req.user.id);
  res.send(badges);
});

//allows updating the current user team
app.post('/api/user/team',  (req, res) => {
   var teamId = req.body.teamId;

   if(util.isNullOrUndefined(teamId) || typeof teamId !== "number"){
      return util.apiResponse(req, res, 400, "Invalid team id."); 
  }

  if(req.user==null || util.isNullOrUndefined(req.user.id)){
      return util.apiResponse(req, res, 500, "Something's wrong with your session. Logout and log back in."); 
  }
   //check if the team exists
   db.getTeamById(teamId,function(){
      util.apiResponse(req, res, 500, "An unknown error occurred. Check the logs.");
   },function(team){
      if(team != null)
      {
        req.user.teamId = teamId;
        db.updateUser(req.user,
            function(){
              util.apiResponse(req, res, 500, "Failed to update user");
            },function(){
              util.apiResponse(req, res, 200, "Team updated for current user");
            }
        );
      }
      else{
        util.apiResponse(req, res, 200, "Team does not exist. Refresh your page.");
      }

   });
   
});




//challenge code api
app.post('/api/user/challengeCode', async (req,res) => {
    try{
      let result = await challenges.apiChallengeCode(req);
      util.apiResponse(req, res, 200, result.message, result.data);
    }
    catch(err){
      switch(err.message){
        case "invalidRequest":util.apiResponse(req, res, 400, "Invalid request."); break;
        case "invalidCode":util.apiResponse(req, res, 400, "Invalid challenge code."); break;
        case "invalidChallengeId":util.apiResponse(req, res, 400, "Invalid challenge id."); break;
        case "invalidModuleId":util.apiResponse(req, res, 400, "Invalid module id."); break;
        case "challengeNotAvailable":util.apiResponse(req, res, 404, "Challenge not found for the current user level"); break; 
        case "challengeSecretNotFound":util.apiResponse(req, res, 404, "Challenge secret not found."); break; 
        case "codeSaveError":util.apiResponse(req, res, 500, "Unable to save code."); break;
        case "levelUpError":util.apiResponse(req, res, 500, "Unable to check level up. Please try again."); break;  
        default: util.apiResponse(req, res, 500, "Unknown error");
      }
    }
    
});


//get the available teams
app.get('/api/teams',  (req, res) => {
   db.fetchTeams(null,function(teamList){
     res.send(teamList);
   });
});

//get the team members
app.get('/api/teams/:teamId/badges', async (req, res) => {
  var teamId = req.params.teamId;
  if(util.isNullOrUndefined(teamId) || validator.isAlphanumeric(teamId) == false){
    return util.apiResponse(req, res, 400, "Invalid team id."); 
  }
  let result = await db.getTeamMembersByBadges(teamId);
  res.send(result);
});


var returnListWithChallengeNames = function(res,list){
  var challengeNames = challenges.getChallengeNames();
  list.forEach(function(item){
    item.challengeName = challengeNames[item.challengeId];
  });
  res.send(list);
};

//get the activity
app.get('/api/activity',  (req, res) => {
  var query = req.query.query;
  if(util.isNullOrUndefined(query)) query = "";
  query = query.trim();
  if(query !== "" && !validator.matches(query,/^[A-Z'\-\s]+$/i)){
    return util.apiResponse(req,res,400,"Invalid query");
  }
  
  db.fetchActivity(query,100,null,function(activityList){
    returnListWithChallengeNames(res,activityList);
  });
});


//get the activity
app.get('/api/activity/heartbeat',  (req, res) => {
  db.fetchActivity(null,1,null,function(activityList){
    returnListWithChallengeNames(res,activityList);
  });
});

//get the challenge stats
app.get('/api/challengeStats',  (req, res) => {
  db.getChallengeStats(null,function(stats){
    returnListWithChallengeNames(res,stats);
  });
});

//get the module stats
app.get('/api/moduleStats', async (req, res) => {
  let stats = await db.getModuleStats();
  res.send(stats);
});

//get the team stats
app.get('/api/teamStats',async (req, res) => {
  var limit = req.query.limit;

  if(util.isNullOrUndefined(limit)){
    limit = null;
  }
  else if (validator.isNumeric(limit) === false){
    return util.apiResponse(req, res, 400, "Invalid value for limit."); 
  }
  else{
    limit = parseInt(limit, 10);
  }
  let stats = await db.getTeamStats(limit);
  res.send(stats);
});

//get all the users
app.get('/api/users',  (req, res) => {
   db.fetchUsers(null, function(users){
     res.send(users);
   });
});


//creates a team setting the current user as owner of the team
app.post('/api/teams', auth.ensureApiAuth, (req, res) => {
   var teamName = req.body.name;

   if(util.isNullOrUndefined(teamName) || validator.matches(teamName,/^[a-z0-9\s_'\-]+$/i)==false){
      return util.apiResponse(req, res, 400, "Team name must be alphanumeric or name punctuation.");
   }

   db.insertTeam(req.user,{name:teamName}, 
      function(){
        util.apiResponse(req, res, 500, "Failed to create team, Check the logs.");
      }, 
      function(){
        //team was created get the newly created team by name and return it in the response also update the user
        db.getTeamWithMembersByName(teamName,
          function(){
            util.apiResponse(req, res, 500, "An error occured fetching the newly created team, Check the logs.");
          },
          function(team){
            req.user.teamId = team.id;
            util.log("User created team "+teamName, req.user);
            util.apiResponse(req, res, 200, "Team created.", team);
          });
      });
});




//allows the user to delete a team that they own
app.delete('/api/user/team',  (req, res) => {
    db.getTeamById(req.user.teamId, 
    function(){
      util.apiResponse(req, res, 500, "Database query error.");
    },
    function(team){
      if(team == null){
        util.apiResponse(req, res, 400, "Could not find team.");
      }
      else if(team.ownerId!=req.user.id){
        util.apiResponse(req, res, 401, "You are not the owner of this team.");
      } 
      else{
        db.deleteTeam(req.user, req.user.teamId, 
          function(){
            util.apiResponse(req, res, 500, "Did not delete team.");
          },function(){
            util.log("User deleted team id "+req.user.teamId, req.user);
            req.user.teamId = null;
            util.apiResponse(req, res, 200, "Team was deleted.");
          });
      }
    });
});

//get a salt for the challenge code
app.get('/api/salt',  (req, res) => {
  req.user.codeSalt = uid.sync(8);
  res.send(req.user.codeSalt);
});

//upload CSV for user report
app.post('/api/reportUpload', async (req, res) => {
  req.user.reportUsers = report.parseReportCSV(req.files.reportCSV.data);
  return util.apiResponse(req,res,200,"User report uploaded");

});
//get a report for training module
app.get('/api/report/:moduleId',  async (req, res) => {

  if(util.isNullOrUndefined(req.user.reportUsers)){
    return util.apiResponse(req,res,204,"User report is not configured");
  }

  if(util.isNullOrUndefined(req.params.moduleId)){
    return util.apiResponse(req,res,400,"Module id required");
  }

  if(!validator.isAlphanumeric(req.params.moduleId)){
    return util.apiResponse(req,res,400,"Module id invalid"); 
  }
  var reportUsers = req.user.reportUsers;
  var requiredModule = req.params.moduleId;
  
  reportUsers = await report.getReportForModuleId(reportUsers,requiredModule);

  res.send(reportUsers);

});

db.init();

process.on('SIGINT', function() {
  process.exit();
});

app.listen(8081,function(){
    util.log('Listening on 8081');
    util.log('Configured url:'+config.dojoUrl);
    util.log('Is secure:'+config.dojoUrl.startsWith("https")); 
});