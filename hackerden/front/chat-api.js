/* 
    Copyright 2023 VMware, Inc.
    SPDX-License-Identifier: Apache-2.0	
*/
const jwt = require('jsonwebtoken')
const challengeCode = require('./challenge-code')
const chatUsers = require('./chat/chatUsers.json')
const JSEncrypt = require('nodejs-jsencrypt').default
const crypto = require('crypto')
let messages = require('./messages.json')
const AUTH_SECRET_INDEX = Math.floor(Math.random() * 10)
const AUTH_SECRETS = ["123456","12345","123456789","Password","iloveyou","princess","rockyou","1234567","12345678","abc123"]
const HDEN_AUTH_SECRET = AUTH_SECRETS[AUTH_SECRET_INDEX]


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
    
    var token = jwt.sign(tokenInfo, HDEN_AUTH_SECRET);
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
      let decoded = await jwt.verify(idToken, HDEN_AUTH_SECRET)

      for(let perm of decoded.permissions){
        if(req.path.indexOf(perm) > -1) return decoded
      }
    } catch (error) {        
      console.log('failed jwt verify: ', error, 'auth: ', idToken);
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
  
  if(user.permissions && user.permissions.length > 0 && user.permissions.length < 10){
    for(let perm of user.permissions){
      if(perm.indexOf("currentuser") >= 0 && user.sub === "test"){
        challengeId = "owasp2017sensitive"
      } 
      else if(perm.indexOf("messages") >= 0){
        challengeId = "owasp2017brokenauth"
        break
      }
    }
  }
      
  if(challengeId!==null){
    let challengeResponse = await challengeCode.getChallengeUrl(challengeId)
    user.challengeCodeUrl = challengeResponse.challengeCodeUrl
  }
  resp.send(user)
}

getMessages = async(req,resp) => {
  let user = await getAuthorizedUser(req);
  
  if(user===null){
    resp.status(403)
    return resp.send("Unauthorized")
  }

  resp.send(messages)
}

postMessage = async(req,resp) => {
  let user = await getAuthorizedUser(req);
  
  if(user===null){
    resp.status(403)
    return resp.send("Unauthorized")
  }

  let message = JSON.parse(JSON.stringify(req.body))
  if(message.type==='encMessage'){
    let challengeResponse = await challengeCode.getChallengeUrl("owasp2017xss")
    let challengeCodeUrl = challengeResponse.challengeCodeUrl
    message = validateMessage(message, challengeCodeUrl)
    if(message.error){
      resp.status(400)
      return resp.send(message.error)
    }
  }

  if(messages.length>1000) messages.splice(4,1)
  messages.push(message)

  resp.send("Message received.")
}

validateMessage = (message, challengeCodeUrl) => {
  //check integrity
  var toHash = "<img src='https://gov.logger.good' width='0px'>"+message.pubKey;
  var hash = crypto.createHash('sha256').update(toHash).digest('hex');

  if(message.integrity===hash){
      var encrypt = new JSEncrypt();
      encrypt.setPublicKey(message.pubKey);
      var re = new RegExp('.{1,40}', 'g');
      var challengeCodeUrlParts = challengeCodeUrl.match(re);
      var encChallengeCodeUrlParts = [];
      challengeCodeUrlParts.forEach(part => {
          encChallengeCodeUrlParts.push(encrypt.encrypt(part));
      });
      message.challengeCodeUrl = encChallengeCodeUrlParts;
      message.nextChallenge = encrypt.encrypt("/ping");
  }
  else{
      message.error = "Invalid encrypted message.";
  }
  return message;
}


module.exports = {
  authenticate,
  getAuthorizedUser,
  getCurrentUser,
  getMessages,
  postMessage
}



