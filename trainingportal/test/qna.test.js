const qna = require("../qna");
const util = require("../util");

describe("qna", () => {
  describe("base64CaesarEnc", () => {

    test("false for incorrect code",()=>{
      let res = qna.getCode("caesar",null,0);
      let wrong = "1234";
      let check = qna.checkCode(wrong, res.digest);
      expect(check).toBeFalsy();
    });

    test("true for correct code",()=>{
      let shifted = qna.getCode("caesar",null,0);
      //shifted did not change at all because the key is 0
      let check = qna.checkCode(shifted.code, res.digest);
      expect(check).toBeTruthy();
    });

  });
});