const express = require('express')
const bodyParser = require('body-parser');
const path = require('path')
const bucket = require('./bucket')
const challengeCode = require('./challenge-code')
const chatApi = require('./chat-api')
const app = express()
app.use(bodyParser.json());



app.use('/chat', express.static(path.join(__dirname,'chat')))
app.use('/code', express.static(path.join(__dirname,'code')))
app.get('/', bucket.listBucket)

app.get('/chat', bucket.listChatFolder)
app.post('/chat/auth', chatApi.authenticate)
app.get('/chat/currentuser', chatApi.getCurrentUser)
app.get('/chat/messages.json', chatApi.getMessages)


app.post('/code/get-code', challengeCode.validate)


app.get('/secret.txt', function (req, res) {
    res.send(challengeCode.getChallengeUrl("owasp2017misconfig"))
})


app.listen(3000)