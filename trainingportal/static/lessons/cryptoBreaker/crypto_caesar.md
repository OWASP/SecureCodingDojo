
#### Welcome to the Encryption module.
In this module you will learn about various ways in which information can be encoded and decoded. 

To solve challenges you will need to execute various transformations on a block of given data. Online resources such as `dCode.fr`, `crackstation.net`, `hashes.com` and others offer tools that can help you in your journey. You may also use your programming language of choice and openssl.

Note: You're allowed to conduct offline brute force attacks, however **trying answer combinations in an automatic fashion using the portal is strictly forbidden**. 

We begin with one of the oldest methods used to hide a message, known to be used by Julius Caesar.

#### Algorithm
Shift letters by a number of positions. The number of positions is the key. 

##### Example
ABCD becomes BCDE shifted right by one.
ABCD becomes ZABC shifted left by one.

##### Weakness
It can be easily deciphered by trying all possible shifts and there are as many shifts as letters in the alphabet.


