const jwt = require('jsonwebtoken');
const challengeCode = require('./challenge-code');
const chatUsers = require('./chat/chatUsers.json');
const crypto = require('crypto');

let messages = require('./messages.json')

authenticate = (req, resp) => {
  var user = chatUsers[req.body.userName]; //get the user entry from the db
  var userPassHash = user.passHash;
  var vfHash = crypto.createHash('sha1').update(req.body.userPass).digest('hex');
  if(userPassHash===vfHash){
    //generate JWT to identify this user
    let permissions = ["currentuser"]

    if(req.body.userName == "badspaghetti" || req.body.userName == "stinkyfish"){
      permissions.add("messages")
    }

    let tokenInfo = {"sub": req.body.userName,"name": user.name, "permissions":permissions}
    
    var token = jwt.sign(tokenInfo, process.env.HDEN_AUTH_SECRET);
    resp.send({"token": token});
  }
  else{
    resp.status(401)
    resp.send("Invalid credentials");
  }

}

getAuthorizedUser = async(req) => {
  var authToken = req.headers.Authorization;
  if(typeof authToken === 'undefined'){
    authToken = req.headers.authorization;
  }

  if(authToken && authToken.split(' ')[0] === 'Bearer') {
    let idToken = authToken.split(' ')[1];
    try {
      let decoded = await jwt.verify(idToken, process.env.HDEN_AUTH_SECRET)

      for(let perm of decoded.permissions){
        if(req.path.indexOf(perm) > -1) return decoded
      }
    } catch (error) {        
      console.log('failed jwt verify: ', err, 'auth: ', idToken);
      return null
    }
  }
  return null
}



getCurrentUser = async(req, resp) => {
  //validate the token 

  let user = await getAuthorizedUser(req);
  
  if(user===null){
    resp.status(403)
    return resp.send("Unauthorized")
  }

  var challengeId = null;
  
  switch(user.sub){
    case "test": challengeId = "owasp2017sensitive"; break;
    case "badspaghetti": challengeId = "owasp2017brokenauth"; break;
    case "stinkyfish": challengeId = "owasp2017brokenauth"; break;
  }
  
      
  if(challengeId!==null){
    let challengeResponse = await challengeCode.getChallengeUrl(challengeId)
    user.challengeCodeUrl = challengeResponse.challengeCodeUrl
    resp.send(user)
     
  }
}

getMessages = async(req,resp) => {
  let user = await getAuthorizedUser(req);
  
  if(user===null){
    resp.status(403)
    return resp.send("Unauthorized")
  }

  resp.send(messages)
}



module.exports = {
  authenticate,
  getAuthorizedUser,
  getCurrentUser,
  getMessages
}



