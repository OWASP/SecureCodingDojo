function MockResponse () {
    
    this.statusCode = 200
    this.responseBody = ""

    this.status = (statusParam) => {
        this.statusCode = statusParam
    }

    this.send = (bodyParam) => {
        this.responseBody = bodyParam
    }

}

module.exports = {
    MockResponse
}