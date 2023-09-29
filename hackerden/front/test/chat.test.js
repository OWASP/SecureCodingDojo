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
        let body = {"type":"encMessage","encMess":"IMVeI6CzUuGCPlmLkC0R4egENfq3jQfXyHnkUSjHz82vDbjXmdWTa7yPMFU3cHkY9dHV8HsboAb+UXJk3JQKkStNa1sgk2R7AmIUHlnv0y8piXvVetUXA5xsqpk5MA251XBjxb4+KVAzRv5EG3B3i0rdg+nwv6WOgzAlq5fGIPo=","pubKey":"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCWedriMgCBBBChO6WRXRk0nKPrfwrou/kW8MprApyARm9Xk3gU5z5Zlikr3CCp0B+pJx4wzYGSedX4pEXCRDuDhn6KJ7R1vFjX0T+LTBdcMXlNgXkExXjRqWoryeQZJG3MxmOnZ1aikIn4QbIcBxIRyzNBFd5zr7lo5dn/1ahSpQIDAQAB","date":"9/28/2023, 9:01:26 PM","integrity":"779f4468eeb46a5a44848be3da3701ed29098f96170199b51d853b0d52bb8b6f"}
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
