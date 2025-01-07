const crypto = require('crypto');
const uid = require('uid-safe');
const path = require('path');
const util = require(path.join(__dirname, 'util'));
const dictionary = ["lorem","ipsum","dolor","sit","amet","adipiscing","elit","maecenas","mollis","nec","libero","non","sed","dictum","vel","ligula","viverra","nunc","vehicula","augue","vitae","cursus","dictum","magna","tortor","tempus","neque","vitae","viverra","mauris","ipsum","vel","eros","nulla","auctor","purus","eget","mattis","tempus","proin","in","aliquam","mi","etiam","massa","arcu","vel","finibus","pretium","quis","ante","etiam","neque","id","bibendum","nisi","enim","gravida","diam","sed","urna","velit","id","ligula","quisque","neque","in","vestibulum","morbi","sit","amet","lectus","Sed","suscipit","velit","ac","magna","aliquam","eu","nisl","dictum","ac","ante","ut","nibh","bibendum","faucibus","egestas","vehicula","neque","aenean","lorem","velit","maximus","nec","placerat","sed","vel","ligula","vivamus","vitae","nisi","in","sit","amet","nulla","non","libero","suscipit"]
const SECRET_WORD_COUNT = 10;
var masterSalt = "";
if(!util.isNullOrUndefined(process.env.CHALLENGE_MASTER_SALT)){
  masterSalt=process.env.CHALLENGE_MASTER_SALT;
}

let getSecretText = (challengeId) => {
  let min = 0;
  let max = dictionary.length - 1;
  secretText = "";
  if(challengeId === "crypto_vigenere"){
    secretText = "LOREM ";
  }

  for(let i=0;i<SECRET_WORD_COUNT;i++){
    let index = util.getRandomInt(min,max);
    secretText += dictionary[index];
    if(i<SECRET_WORD_COUNT-1) secretText += " ";
  }
  return secretText.toUpperCase();
}

let getRes = (mes, code) => {
  let digest = crypto.createHash('sha256').update(mes.trim()+masterSalt).digest('hex');
  return res = {
    code:code,
    digest:digest, 
  }
}

let getCode = (challengeId, message, key) => {

  let mes;
  if(message){
    mes = message;
  }
  else{
    mes = getSecretText(challengeId);
  }

  return DEFS[challengeId](mes, key);
}

let checkCode = (mes, digest) => {
  let vfy = crypto.createHash('sha256').update(mes+masterSalt).digest('hex');
  return vfy === digest;
}

let shiftChar = (char, diff) => {
  if(char === ' '){ //skip spaces
    return ' ';
  }
  
  let newCode = char.charCodeAt(0) + diff
  if(newCode > "Z".charCodeAt(0)){
    let diffToZ = newCode - "Z".charCodeAt(0);
    newCode = "A".charCodeAt(0) + diffToZ - 1;
  }
  
  return String.fromCharCode(newCode);
}

let caesarEnc = (mes, key) => {
  let diff;
  if(util.isNullOrUndefined(key)){
    diff = util.getRandomInt(10,20);
  }
  else{
    diff = key;
  }

  let shifted = "";
  for(let i=0;i<mes.length;i++){
    let char = mes.charAt(i);
    shifted += shiftChar(char, diff);
    
  }
  return getRes(mes, shifted);
}

let vigenereEnc = (mes, key) => {
  let keyArray = [];
  let keyLen = 3;

  if(util.isNullOrUndefined(key)){
    for(let i = 0; i<keyLen; i++){
      keyArray.push(util.getRandomInt(10,20));
    }  
  }
  else{
    keyLen = key.length;
    for(let i=0;i<keyLen;i++){
      keyArray.push(key.charCodeAt(i) - "A".charCodeAt(0));
    }
  }

  let shifted = "";
  let kIdx = 0;
  for(let i=0;i<mes.length;i++){
    let char = mes.charAt(i);
    shifted += shiftChar(char, keyArray[kIdx]);
    if(char !== ' '){
      kIdx++;
    }
    if(kIdx === keyLen){
      kIdx = 0;
    }
  }
  return getRes(mes, shifted);
}

let getASCIIHexCode = (no) => {
  if(no < 16){
    return "0" + no.toString(16).toUpperCase();
  }
  return no.toString(16).toUpperCase();
}

let asciiEnc = (mes) => {
  let encoding = "";
  for(let i=0;i<mes.length;i++){
    encoding += getASCIIHexCode(mes.charCodeAt(i));
    if(i<mes.length-1){
      encoding += " "
    }
  }
  return getRes(mes, encoding);
}

let base64Enc = (mes) => {
  let code = util.btoa(mes);
  return getRes(mes, code);
}

let hashEnc = (mes) => {
  let words = mes.split(" ");
  let hashedWords = [];
  let hashes = [];
  for(let word of words){
    let hash = crypto.createHash('md5').update(word).digest('hex');
    if(hashedWords.indexOf(word) === -1){
       hashedWords.push(word);
       hashes.push(hash);
    }
  }
  return getRes(hashedWords.join(" "), hashes.join("\n"));
}

let xorEnc = (message) => {
  let key = message 
  let mes = "LOREM IPSUM DOLOR SIT AMET"
  key = key.substring(0, mes.length);
  let keyArray = [];
  for(let i=0;i<key.length;i++){
    keyArray.push(key.charCodeAt(i));
  }

  let cipher = xorOp(mes, keyArray);
  return getRes(key, cipher);
}

let xorOp = (mes, key) => {
  let kIdx = 0;
  let cipher = "";

  for(let i=0; i < mes.length; i++){
    let mCode = mes.charCodeAt(i);
    let kCode = key[kIdx];
    let cCode = mCode ^ kCode;
    cipher += getASCIIHexCode(cCode);
    kIdx++;
    if(kIdx == key.length) kIdx = 0;
    if(i<mes.length-1) cipher+=" ";
  }
  return cipher;
}


let pbkEnc = (mes) => {
  let passwordString = "LOREM";
  let saltString = "IPSUM";

  let password = Buffer.from(passwordString);
  let salt = Buffer.from(saltString);
  
  let key = crypto.pbkdf2Sync(password, salt, 1000, 32, "SHA256");
  let cipher = xorOp(mes,key);
  return getRes(mes, cipher);
}


let analysisEnc = (mes) => {
  let goldenKeyMaterial = mes;
  let goldenKeyWords = goldenKeyMaterial.split(" ");
  let goldenKeySalt = goldenKeyWords[0];
  let goldenKeyShift = goldenKeyWords[1];
  let goldenKeySaltHash = crypto.createHash('md5').update(goldenKeySalt).digest("hex");
  let goldenKeyShiftHash = crypto.createHash('md5').update(goldenKeyShift).digest("hex");
  let goldenKeyScramble = vigenereEnc(goldenKeyMaterial,goldenKeyShift).code;
  let pass = Buffer.from(goldenKeyMaterial);
  let salt = Buffer.from(goldenKeySalt);
  let keyBytes = 32;
  let keyAlg = "SHA256";
  let keyIter = 1000;
  let goldenKey = crypto.pbkdf2Sync(pass, salt, keyIter, keyBytes, keyAlg).toString("hex");
  let keyInfo = {
    "keyMaterialShifted": goldenKeyScramble,
    "goldenKeyShiftHash": goldenKeyShiftHash,
    "goldenKeySaltHash": goldenKeySaltHash,
    "hashingFunction":"SHA256",
    "iter":keyIter
  }
  let keyInfoB64 = util.btoa(JSON.stringify(keyInfo));
  let postData = `kmb64=${keyInfoB64}`;
  let post = `POST / HTTP/1.1\n`;
  post+=`Host: finance.biznis\n`;
  post+=`Content-length: ${postData.length}\n\n`;
  post+= postData;

  let mesKey = crypto.randomBytes(16);
  let cipher = xorOp(post,mesKey);
  return getRes(goldenKey, cipher);
}

const DEFS = {
  "crypto_caesar": caesarEnc,
  "crypto_vigenere": vigenereEnc,
  "crypto_ascii": asciiEnc,
  "crypto_base64": base64Enc,
  "crypto_hash": hashEnc,
  "crypto_xor": xorEnc,
  "crypto_pbk": pbkEnc,
  "crypto_analysis": analysisEnc
}

module.exports = {
  DEFS,
  getCode,
  checkCode,
  xorOp
}

