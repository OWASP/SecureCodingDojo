const assert = require('assert');
const chatApi = require('../chat-api')
const {MockResponse} = require('./mock.js')
const jwt = require('jsonwebtoken')

describe('Chat', function () {

  describe('mockResp', function () {

    it('should return correct status', function () {
        let mockResp = new MockResponse()
        mockResp.status(999)
        assert.equal(mockResp.statusCode, 999)
    })

    it('should return correct body', function () {
        let mockResp = new MockResponse()
        mockResp.send({"message":"All good!"})
        assert.equal(mockResp.responseBody.message, "All good!")
    })

  })

  describe('chatApi.authenticate', function () {

    it('should return 400 for invalid request', function () {
        let mockResp = new MockResponse()
        chatApi.authenticate({}, mockResp)
        assert.equal(mockResp.statusCode, 400)
    })

    it('should return 401 for incorrect user name and password', function () {
        let mockResp = new MockResponse()
        chatApi.authenticate({"body":{"userName":"test","userPass":"bla"}}, mockResp)
        assert.equal(mockResp.statusCode, 401)
    })

  })

  describe('chatApi.getCurrentUser', function () {

    it('should return 400 for invalid request', async function () {
        let mockResp = new MockResponse()
        await chatApi.getCurrentUser({}, mockResp)
        assert.equal(mockResp.statusCode, 400)
    })

    it('should return 403 for incorrect authorization header', async function () {
        let mockResp = new MockResponse()
        await chatApi.getCurrentUser({"headers":{"authorization":"INVALID"}}, mockResp)
        assert.equal(mockResp.statusCode, 403)
    })

    it('should return 200 for valid authorization header', async function () {
        let mockResp = new MockResponse()
        let jwt = chatApi.sign({"sub":"unit_test","permissions":["currentuser"]})

        await chatApi.getCurrentUser({"path":"/currentuser", "headers":{"authorization":`Bearer ${jwt}`}}, mockResp)
        assert.equal(mockResp.statusCode, 200)
        assert.equal(mockResp.responseBody.sub,"unit_test")
        assert.equal(null, mockResp.responseBody.challengeCodeUrl, "Challenge should NOT be passed")
    })

    it('should return challenge code for test user', async function () {
        let mockResp = new MockResponse()
        let jwt = chatApi.sign({"sub":"test","permissions":["currentuser"]})

        await chatApi.getCurrentUser({"path":"/currentuser", "headers":{"authorization":`Bearer ${jwt}`}}, mockResp)
        assert.equal(mockResp.statusCode, 200)
        assert.equal(mockResp.responseBody.sub,"test")
        assert.notEqual(null, mockResp.responseBody.challengeCodeUrl, "Challenge should be passed")

    })
    

  })


  describe('chatApi.getMessages', function () {

    it('should return 400 for invalid request', async function () {
        let mockResp = new MockResponse()
        await chatApi.getMessages({}, mockResp)
        assert.equal(mockResp.statusCode, 400)
    })

    it('should return 403 for incorrect authorization header', async function () {
        let mockResp = new MockResponse()
        await chatApi.getMessages({"headers":{"authorization":"INVALID"}}, mockResp)
        assert.equal(mockResp.statusCode, 403)
    })

    it('should return 200 for valid authorization header', async function () {
        let mockResp = new MockResponse()
        let jwt = chatApi.sign({"sub":"unit_test","permissions":["currentuser","messages"]})

        await chatApi.getMessages({"path":"/currentuser", "headers":{"authorization":`Bearer ${jwt}`}}, mockResp)
        assert.equal(mockResp.statusCode, 200)
        assert.equal(mockResp.responseBody.length > 0,true)
    })
    

  })


  describe('chatApi.postMessage', function () {

    it('should return 400 for invalid request', async function () {
        let mockResp = new MockResponse()
        await chatApi.postMessage({}, mockResp)
        assert.equal(mockResp.statusCode, 400)
    })

    it('should return 403 for incorrect authorization header', async function () {
        let mockResp = new MockResponse()
        await chatApi.postMessage({path:"/messages ","body":{},"headers":{"authorization":"INVALID"}}, mockResp)
        assert.equal(mockResp.statusCode, 403)
    })

    it('should  add a regular message', async function () {
        let mockResp = new MockResponse()
        let jwt = chatApi.sign({"sub":"unit_test","permissions":["currentuser","messages"]})
        let body = {message:"test"}
        await chatApi.postMessage({"body":body, "path":"/messages", "headers":{"authorization":`Bearer ${jwt}`}}, mockResp)
        assert.equal(mockResp.statusCode, 200)
        assert.equal(mockResp.responseBody,"Message received.")
    })

    it('should return error for malformed encrypted message', async function () {
        let mockResp = new MockResponse()
        let jwt = chatApi.sign({"sub":"unit_test","permissions":["currentuser","messages"]})
        let body = {"type":"encMessage"}
        await chatApi.postMessage({"body":body, "path":"/messages", "headers":{"authorization":`Bearer ${jwt}`}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
        assert.equal(mockResp.responseBody,"Invalid encrypted message.")
    })

    it('should return error for the wrong encrypted message', async function () {
        let mockResp = new MockResponse()
        let jwt = chatApi.sign({"sub":"unit_test","permissions":["currentuser","messages"]})
        let body = {"type":"encMessage","encMess":"dMkn3lmTYAhyVLCsSV4sK8Z67jKT6CBuUMLT1Dn6hl51y4i+mg3XJaKQmvF+aYxJmUl4pCRG6z413WEhnhOpfHkuCEo3Awn+qJofQfsBblfkzsT4aeLUjJrPsXt60l43uB+gAWnd2K1LHJ+KrgA6jMnlRiPNwzEPt471gp8t5YM=","pubKey":"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCi35NVRl7A9xbNgH6nhKLjqpFPAgCyFlEq14+0L5bzvqMAH2dFQfCBKM1VO+6wQR0UbHA0/AoP1+ypl9zfwhUNtMwFghVtaq1AY08/BXf3dfQ6VcE2pi8H/W7HC/JimW9HzYdnDsQ4f8FZn5Zy/ZHVWMcT+Cw/NLLhZurD9/XrLQIDAQAB","date":"2023-09-26, 8:23:20 p.m.","integrity":"565280e5e80e2b37aef2b9b2f3253d2640d0df7ff4e2153faad42edcdce942e0"}

        await chatApi.postMessage({"body":body, "path":"/messages", "headers":{"authorization":`Bearer ${jwt}`}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
        assert.equal(mockResp.responseBody,"Invalid encrypted message.")
    })
    
    it('should pass challenge for the correct encrypted message', async function () {
        let mockResp = new MockResponse()
        let jwt = chatApi.sign({"sub":"unit_test","permissions":["currentuser","messages"]})
        let body = {"type":"encMessage","encMess":"OHqH+QeS1rUXqJ+l+DFGzao3XwyuU8PIm2TxcZzkq2AaCte3P6rwJtkPX8BBSQ5WzeP2H8Z9cASgM4BgXRi10IshIHw7J+5DeAYs5MkvVCXodSVSyjZatSstUdjWEiL+YWVhbgH7Yy41+CjufU/dKmV56Phmsgnj1ba270qwlEM=","pubKey":"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCm/+WgoP8bEMtSk2XInAM4O7i+Tylrrh+1G4LmyLElbyfZUyqBcvGFrBn7rbX2FxZ6xGegTEjzqcNlnTMACM0CeSyPVZ0dSO13eduhwYFY/IMZ/78JYGLu9H045gVB9Ati+2nRfr/Qlxg7W2WO4Lf1eWOVRX/i46outeXhJo3XdwIDAQAB","date":"2023-09-28, 8:40:43 p.m.","integrity":"e745bbd9037587dead485b997be1d7dba1cfdb6f855ae8d7746828f8c587c1c2"}

        await chatApi.postMessage({"body":body, "path":"/messages", "headers":{"authorization":`Bearer ${jwt}`}}, mockResp)
        assert.equal(mockResp.statusCode, 200)
        assert.equal(mockResp.responseBody,"Message received.")

        mockResp = new MockResponse()

        await chatApi.getMessages({"path":"/currentuser", "headers":{"authorization":`Bearer ${jwt}`}}, mockResp)
        assert.equal(mockResp.statusCode, 200)
        let messages = mockResp.responseBody
        let len = messages.length
        assert.equal(len > 0,true)
        assert.notEqual(messages[len-1].challengeCodeUrl.len > 0,true)
        assert.notEqual(messages[len-1].nextChallenge ,null)

    })
    
    
  })

})
