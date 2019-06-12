const path = require('path');
const aescrypto = require(path.join(__dirname, '../aescrypto'));
console.log(aescrypto.decrypt(process.argv[2]));