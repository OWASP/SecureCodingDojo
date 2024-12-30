const qna = require("../qna");
const util = require("../util");
const assert = require("assert");

describe("qna", () => {

  describe("crypto", () => {

    test("false for incorrect code",()=>{
      let text = "PLAIN_TEXT";
      for(let alg in qna.DEFS){
        let res = qna.getCode(alg,text);
        let wrong = "1234";
        let check = qna.checkCode(wrong, res.digest);
        assert(check === false, `Validation passed for wrong text using ${alg}`);
      }
      
    });

    test("true for correct code",()=>{
      let text = "PLAIN_TEXT";
      for(let alg in qna.DEFS){
        let res = qna.getCode(alg,text);
        let check = qna.checkCode(text, res.digest);
        assert(check === true, `Validation failed for correct text using ${alg}`);
      }
    });


    test("vignere should return plain text for 'AAA'",()=>{
      let text = "PLAIN TEXT";
      let expected = "BYOUA HQKH"
      let key = "MNO"
      let res = qna.getCode("vignere",text,key);
      assert.strictEqual(res.code, expected, "Did not result in the same cipher for key: 'MNO'");

    });

  });


});