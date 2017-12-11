const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const db = require(path.join(__dirname, 'db'));
const auth = require(path.join(__dirname, 'auth'));
const util = require(path.join(__dirname, 'util'));
const config = require(path.join(__dirname, 'config'));
const challengeDefinitions = Object.freeze(require(path.join(__dirname, 'static/challenges/challengeDefinitions.json')));
const challengeSecrets = Object.freeze(require(path.join(__dirname, 'challengeSecrets.json')));
const crypto = require('crypto');
const aescrypto = require(path.join(__dirname, 'aescrypto'));
const uid = require('uid-safe');
const validator = require('validator');

//INIT
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(auth.getSession());

const passport = auth.getPassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(auth.authenticationByDefault);
app.use(auth.addSecurityHeaders);
app.use('/public',express.static(path.join(__dirname, 'public')));
app.use('/static',express.static(path.join(__dirname, 'static')));

//ROUTES

app.get("/",(req,res) => {
    res.redirect('/public/index.html');
});

app.get("/public/providers",(req,res) => {
  var providers = [];
  if("googleClientId" in config) providers.push({"name":"Google","url":"/public/provider/google"});
  if("slackClientId" in config) providers.push({"name":"Slack","url":"/public/provider/slack"});
  if("localUsersPath" in config) providers.push({"name":"Local","url":"/public/provider/local"});

  res.send(providers);
});

app.get("/public/captcha.png", auth.getCaptcha);

app.post("/public/register", auth.registerLocalUser);


app.get('/public/provider/:provider', (req,res) => {
  //invalidate any active session
  var redirect = '';
  if(req.params.provider == 'slack') redirect = '/public/slack';
  else if(req.params.provider == 'google') redirect = '/public/google';
  else if(req.params.provider == 'local') redirect = '/public/locallogin';
  auth.logoutAndKillSession(req, res, redirect);
});


app.get('/public/google',
  passport.authenticate('google', { scope: 
  	[ 'https://www.googleapis.com/auth/userinfo.email', 
      'https://www.googleapis.com/auth/userinfo.profile'] }
));

app.get( '/public/google/callback', passport.authenticate( 'google', { 
		successRedirect: '/main',
		failureRedirect: '/public/authFail.html'
}));


// path for slack authj
app.get('/public/slack', passport.authenticate('slack'));
 
// OAuth callback url 
app.get( '/public/slack/callback', passport.authenticate( 'slack', { 
		successRedirect: '/main',
		failureRedirect: '/public/authFail.html'
}));
 

app.get('/public/locallogin', (req, res) => {
   res.redirect('/public/locallogin.html');
});

app.post('/public/locallogin', passport.authenticate('local', { failureRedirect: '/public/authFail.html' }),
function(req, res) {
  res.redirect('/main');
});

app.get("/public/authFailure",(req,res) => {
    res.send('Unable to login');
});

app.get('/logout', auth.logout);

app.get('/main', (req, res) => {
  var mainHtml = fs.readFileSync(path.join(__dirname, 'main.html'),'utf8');
  mainHtml = auth.addCsrfToken(req, mainHtml);
  res.send(mainHtml);
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

//allows updating the current user team
app.post('/api/user/team',  (req, res) => {
   var teamId = req.body.teamId;

   if(util.isNullOrUndefined(teamId) || validator.isAlphanumeric(teamId) == false){
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

   })
   
});



//allows updating the current user team
app.post('/api/user/challengeCode', (req, res) => {
    var challengeId = req.body.challengeId.trim();
    var challengeCode = req.body.challengeCode.trim();

    if(util.isNullOrUndefined(challengeCode) || validator.isBase64(challengeCode) == false){
      return util.apiResponse(req, res, 400, "Invalid challenge code."); 
    }

    if(util.isNullOrUndefined(challengeId) || validator.isAlphanumeric(challengeId) == false){
      return util.apiResponse(req, res, 400, "Invalid challenge id."); 
    }


    //check id
    var availableChallenges = null;
    var curChallengeObj = null;
    var userLevel = req.user.level+1;
    if(req.user.level === null) req.user.level = 0;

    //identify the current challenge object and also the available challenges for the current user level
    for(var idx=0;idx<challengeDefinitions.length;idx++){
      var levelObj = challengeDefinitions[idx];
      var levelChallenges = levelObj.challenges;
      if(levelObj.level===userLevel){
        availableChallenges = levelChallenges;
      }
    }

    if(availableChallenges==null || availableChallenges.length==0) return util.apiResponse(req, res, 400, "No challenges available for the current user level");

    //search for the current challenge id
    for(var cIdx=0; cIdx<availableChallenges.length; cIdx++){
      if(challengeId === availableChallenges[cIdx].id){
        curChallengeObj = availableChallenges[cIdx];
        break;
      }
    }
    
    if(curChallengeObj==null) return util.apiResponse(req, res, 404, "Challenge not found for the current user level");

    var secretEntry = challengeSecrets[challengeId];
    if(secretEntry==null) return util.apiResponse(req, res, 404, "Challenge id not found.");
    
    if(util.hasKey())
      secretEntry = aescrypto.decrypt(secretEntry,process.env.CHALLENGE_KEY,process.env.CHALLENGE_KEY_IV);
  
    //calculate the hash
    var verificationHash = crypto.createHash('sha256').update(secretEntry+req.user.codeSalt).digest('base64');
    if(verificationHash!==challengeCode){
      return util.apiResponse(req, res, 400, "Invalid code.");
    } 

    //success update challenge
    db.insertChallengeEntry(req.user.id,challengeId,function(){
      util.apiResponse(req, res, 500, "Unable to save code. Please try again.");
    },function(){
      //check to see if the user levelled up
      db.fetchChallengeEntriesForUser(req.user,function(){
        util.apiResponse(req, res, 500, "Unable to check level up. Please try again.");
      },function(entries){
          if(entries==null || entries.length==0) util.apiResponse(req, res, 500, "Unable to save code. Please try again.");
          else{
              //check if the user challenges from the database match the available challenges
              var completedChallenges = {};
              var completedChallengesCount = 0;
              for(var entriesIdx=0;entriesIdx<entries.length;entriesIdx++){
                var curEntry = entries[entriesIdx];
                for(var challengeIdx=0;challengeIdx<availableChallenges.length;challengeIdx++){
                    var challenge = availableChallenges[challengeIdx];
                    if(!util.isNullOrUndefined(completedChallenges[challenge.id])) continue;
                    if(curEntry.challengeId===challenge.id){
                        completedChallenges[challenge.id] = true;
                        completedChallengesCount++;
                        break;//we found a match for the current entry
                    }
                }
              }

              var isLevelUp = completedChallengesCount==availableChallenges.length;
              curChallengeObj.isLevelUp = isLevelUp;

              if(isLevelUp){
                req.user.level++;
                db.updateUser(req.user,
                  function(){
                    util.apiResponse(req, res, 500, "Failed to update user level. Please try again.");
                  },function(){
                    //check if it's the last level before master level
                    if(req.user.level === challengeDefinitions[challengeDefinitions.length-2].level){
                      //update the team lead async
                      db.levelUpTeamLead(req.user.teamId, req.user.level, null, null);
                    }
                    util.log("User has solved the challenge "+curChallengeObj.name+" and leveled up!", req.user);
                    util.apiResponse(req, res, 200, "Congratulations you solved the challenge and leveled up!", curChallengeObj)
                    
                  });
                
              }
              else{
                util.log("User has solved the challenge "+curChallengeObj.name+"!", req.user);
                util.apiResponse(req, res, 200, "Congratulations you solved the challenge!", curChallengeObj)
              }
            
          }

      });
    });

   
});


//get the available teams
app.get('/api/target',  (req, res) => {
   res.send(config.dojoTargetUrl);
});


//get the available teams
app.get('/api/teams',  (req, res) => {
   db.fetchTeams(null,function(teamList){
     res.send(teamList);
   })
});

//get the activity
app.get('/api/activity',  (req, res) => {
  var query = req.query.query;
  if(util.isNullOrUndefined(query)) query = "";
  query = query.trim();
  if(query !== "" && !validator.matches(query,/^[A-Z'\-\s]+$/i)){
    return util.apiResponse(req,res,400,"Invalid query");
  }
  
  db.fetchActivity(query,100,null,function(activityList){
    res.send(activityList);
  });
});

//get the activity
app.get('/api/activity/heartbeat',  (req, res) => {
  db.fetchActivity(null,1,null,function(activityList){
    res.send(activityList);
  });
});


//get all the users
app.get('/api/users',  (req, res) => {
   db.fetchUsers(null, function(users){
     res.send(users);
   })
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

db.init();

app.listen(8081,function(){
    util.log('Listening on 8081');
    util.log('Configured url:'+config.dojoUrl);
    util.log('Is secure:'+config.isSecure); 
});