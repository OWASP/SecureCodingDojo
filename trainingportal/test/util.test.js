const util = require("../util");

describe('util', () => {
  describe('getRandomInt', () => {

    test('throw error for incorrect parameters',()=>{
      let errThrown = false;
      try {
        util.getRandomInt(30,10);
      } catch (error) {
        errThrown = true;
      }
      expect(errThrown).toBeTruthy();
    });

    test('return number within bounds',()=>{
      let min = 10;
      let max = 20;

      let val = util.getRandomInt(min, max);
      
      expect(val >= min).toBeTruthy();
      expect(val <= max).toBeTruthy();
    
    });

    

  });

  describe('bato-atob', () => {

    test('should decode-encode correctly',()=>{
      let mes = "ABCD";
      let encoded = util.btoa(mes);
      let decoded = util.atob(encoded);
      expect(decoded).toEqual(mes);
    });

  });

});