const crypto = require('crypto');
const uid = require('uid-safe');
const path = require('path');
const util = require(path.join(__dirname, 'util'));
const dictionary = ["lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","maecenas","mollis","nec","libero","non","venenatis","sed","dictum","vel","ligula","pharetra","viverra","nunc","vehicula","augue","vitae","cursus","dictum","magna","tortor","tempus","neque","vitae","viverra","mauris","ipsum","vel","eros","nulla","auctor","purus","eget","mattis","tempus","proin","in","aliquam","mi","etiam","massa","arcu","dapibus","vel","interdum","finibus","pretium","quis","ante","etiam","venenatis","neque","id","imperdiet","bibendum","nisi","enim","gravida","diam","sed","iaculis","urna","velit","id","ligula","quisque","eleifend","neque","in","vestibulum","venenatis","morbi","sit","amet","euismod","lectus","Sed","suscipit","velit","ac","magna","aliquam","eu","tincidunt","nisl","dictum","curabitur","ac","ante","ut","nibh","bibendum","faucibus","egestas","vehicula","neque","aenean","lorem","velit","maximus","nec","placerat","sed","hendrerit","vel","ligula","vivamus","laoreet","vitae","nisi","in","laoreet","curabitur","sit","amet","nulla","non","libero","porttitor","suscipit"]
const SECRET_WORD_COUNT = 10;
var masterSalt = "";
if(!util.isNullOrUndefined(process.env.CHALLENGE_MASTER_SALT)){
  masterSalt=process.env.CHALLENGE_MASTER_SALT;
}

let getSecretText = () => {
  let min = 0;
  let max = dictionary.length - 1;
  secretText = "";
  for(let i=0;i<SECRET_WORD_COUNT;i++){
    let index = util.getRandomInt(min,max);
    secretText += dictionary[index];
    if(i<SECRET_WORD_COUNT-1) secretText += " ";
  }
  return secretText;
}

let getRes = (mes, code) => {
  let digest = crypto.createHash('sha256').update(mes+masterSalt).digest('hex');
  return res = {
    code:code,
    digest:digest, 
  }
}

let getCode = (challengeId, key) => {
  let mes = getSecretText();
  let code = DEFS[challengeId](mes, key);
  return getRes(mes, code);
}

let checkCode = (mes, digest) => {
  let vfy = crypto.createHash('sha256').update(mes+masterSalt).digest('hex');
  return vfy === digest;
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
    if(char === ' '){ //skip spaces
      shifted += ' ';
    }
    else {
      let newCode = mes.charCodeAt(i) + diff
      if(newCode > "z".charCodeAt(0)){
        let diffToZ = newCode - "z".charCodeAt(0);
        newCode = "a".charCodeAt(0) + diffToZ - 1;
      }
      shifted+= String.fromCharCode(newCode);
    }
  }
  return shifted
}

let asciiEnc = (mes) => {
  let encoding = "";
  for(let i=0;i<mes.length;i++){
    encoding += mes.charCodeAt(i)
    if(i<mes.length-1){
      encoding += " "
    }
  }
  return encoding;
}

let base64Enc = (mes) => {
  let code = util.btoa(mes);
  return code;
}



const DEFS = {
  "caesar": caesarEnc,
  "ascii": asciiEnc,
  "base64": base64Enc
}

module.exports = {
  getCode,
  checkCode
}

