
#### Welcome to the Encryption module.
In this module you will learn about various ways in which information can be encoded and decoded. 

To solve challenges you will need to execute various transformations on a block of given data. 

There are several online resources that can help you in your journey. 
For example `dCode.fr` : includes a large variety of encoding, hashing and encryption tools.
`hashes.com` includes a large collection of hashes. 
There are many online resources that you can use besides these sites. You may also use your programming/scripting language of choice.

**NOTE: If you decide to view the solution, open the solution as a new tab or window so you don't reset the cipher.**

`Important Note: You're allowed to conduct offline brute force attacks, however trying answer combinations in an automatic fashion using the portal is strictly forbidden.` 

We begin with one of the oldest methods used to hide a message, known to be used by Julius Caesar.

#### Algorithm

Shift letters by a number of positions. The number of positions is the key. 

##### Example

ABCD becomes BCDE shifted right by one.

ABCD becomes ZABC shifted left by one.

##### Weaknesses
The Caesar cipher can be easily deciphered by trying all possible shifts and there are as many shifts as letters in the alphabet. This is also known as `brute forcing` or `cracking` the key.

Another weakness is that the sequence of characters stays the same.

For example using a shift of 10:

      `what is the name of the store`
      `grkd sc dro xkwo yp dro cdybo`

We can notice that `the`, one of the most frequent words in the English language, becomes `dro`. Using this knowledge we can reverse the key value of 10. 

Another aspect that can be used is the frequency of letters in a language. For example the letter `e` is the most frequently used in English. Indeed in the chosen text `e` appears 3 times while in the cipher we see `o` appearing 3 times. We can easily derive the key as being the number of positions from `e` to `o`.

This is called `frequency analysis`.

#### References

[Wikipedia: Caesar Cipher](https://en.wikipedia.org/wiki/Caesar_cipher)