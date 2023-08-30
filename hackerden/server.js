const express = require('express')
const bodyParser = require('body-parser');
const path = require('path')
const bucket = require('./bucket')
const challengeCode = require('./challenge-code')
const chatApi = require('./chat-api')
const app = express()
app.use(bodyParser.json());

app.use('/jquery', express.static(path.join(__dirname,'node_modules/jquery/dist')))
app.use('/bootstrap', express.static(path.join(__dirname,'node_modules/bootstrap/dist')))
app.use('/jsencrypt', express.static(path.join(__dirname,'node_modules/nodejs-jsencrypt/bin')))
app.use('/angular', express.static(path.join(__dirname,'node_modules/angular')))
app.use('/crypto-js', express.static(path.join(__dirname,'node_modules/crypto-js')))


app.use('/chat', express.static(path.join(__dirname,'chat')))
app.use('/code', express.static(path.join(__dirname,'code')))

app.get('/', bucket.listBucket)

app.get('/chat', bucket.listChatFolder)
app.post('/chat/auth', chatApi.authenticate)
app.get('/chat/currentuser', chatApi.getCurrentUser)
app.get('/chat/messages.json', chatApi.getMessages)
app.post('/chat/messages', chatApi.postMessage)


app.post('/code/get-code', challengeCode.validate)


app.get('/secret.txt',  async(req, res) => {
    let ch = await challengeCode.getChallengeUrl("owasp2017misconfig")
    res.send(ch)
})


app.listen(3000)