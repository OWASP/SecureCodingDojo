const assert = require('assert');
const netUtil = require('../network-utils')
const {MockResponse} = require('./mock.js')

describe('Network Utils', function () {

  describe('mockResp', function () {

    it('should reject cheating by printing the FLAG', function () {
        let mockResp = new MockResponse()
        netUtil.ping({"body":{"hostname":"echo FL''AG"}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
    })

    it('should reject destructive commands', function () {
        let mockResp = new MockResponse()
        netUtil.ping({"body":{"hostname":"rm -rf /"}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
        netUtil.ping({"body":{"hostname":"mv /etc/passwd /tmp/passwd"}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
    })

    it('should reject exfiltrating password files', function () {
        let mockResp = new MockResponse()
        netUtil.ping({"body":{"hostname":"cat /etc/passwd"}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
        netUtil.ping({"body":{"hostname":"cat /etc/shadow"}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
    })

    it('should prevent manipulating the output', function () {
        let mockResp = new MockResponse()
        netUtil.ping({"body":{"hostname":"echo bla"}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
        netUtil.ping({"body":{"hostname":"print bla"}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
        netUtil.ping({"body":{"hostname":"sed 's:not::'"}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
        netUtil.ping({"body":{"hostname":"base64"}}, mockResp)
        assert.equal(mockResp.statusCode, 400)
    })
    
  })

})
