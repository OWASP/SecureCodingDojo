var crypto = require('crypto');
const path = require('path');
var config = require(path.join(__dirname, 'config'));
var util = require('util');

function getEncParams(keySeed,ivSeed){
    var myKeySeed = keySeed;
    var myIvSeed = ivSeed;
    if(util.isNullOrUndefined(myKeySeed) || util.isNullOrUndefined(myIvSeed)){
       var myKeySeed = process.env.ENC_KEY;
       var myIvSeed = process.env.ENC_KEY_IV;
    }
    var cryptkey = crypto.createHash('sha256').update(myKeySeed).digest();
    var iv = crypto.createHash('sha256').update(myIvSeed).digest().slice(0,16);

    return {key:cryptkey, iv:iv};
}

exports.decrypt = function(encryptdata, keySeed, ivSeed) {
    var keyParams = getEncParams(keySeed,ivSeed);
    encryptdata = new Buffer(encryptdata, 'base64').toString('binary');
    var decipher = crypto.createDecipheriv('aes-256-cbc', keyParams.key, keyParams.iv);
    var decoded  = decipher.update(encryptdata, 'binary', 'utf8');
    decoded += decipher.final('utf-8');
    return decoded;
}

exports.encrypt = function(cleardata, keySeed, ivSeed) {
    var keyParams = getEncParams(keySeed,ivSeed);

    var encipher = crypto.createCipheriv('aes-256-cbc', keyParams.key, keyParams.iv);
    var encryptdata  = encipher.update(cleardata, 'utf8', 'binary');

    encryptdata += encipher.final('binary');
    encode_encryptdata = new Buffer(encryptdata, 'binary').toString('base64');
    return encode_encryptdata;
}

