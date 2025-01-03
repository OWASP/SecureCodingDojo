
The Vignere cipher is a variation of the Caesar cipher. Vignere uses longer keys, which are harder to guess.

#### Algorithm
The key contains a sequence of characters which represent shifts. For example `A` would represent `0` shifts being the first letter of the alphabet. `B` would represent `1` shift.

##### Example
Given the key `ABCD`. 

     `AAAA` becomes `ABCD` 
     `ABCD` becomes `ACEG` 

##### Weakness
The Vignere was considered unbreakable for almost 200 years until the discovery of a method called Kasiski examination.

This method takes advantage of the fact that for a large block of text with a fixed length key, common words tend to repeat. 

For example using the key `ABC` we have the following substitution.

    `what is the name of the store`
    `wict ju tig nboe ph tig suqrf`

In the case of the Caesar cipher we were able to determine the code for letter `e`, knowing that `e` must be the most common letter in the text. The Vignere cipher can address this problem if the key is sufficiently long.

In the example we notice the word `tig` appears twice and assuming this word represents `the`, one of the most common English words, we can easily derive the key. 

Cracking the code becomes harder when longer keys are used and especially if multiple keys with different lengths are used. 

For example using `ABCDEFG` as key, it's becoming more difficult to recognize the common words. Applying one more transformation using a different key: `HIJK` increases the difficulty of cracking the cipher further.

     `what is the name of the store`
     `wicw mx zhf pdqj uf ujh wyurf` <= `ABCDEFG`
     `dqlg tf irm xmaq co eqp fibzo` <= `HIJK`

Modern cryptographic algorithms use multiple rounds of transformations. Each round uses a different subkey derived from the initial key.

#### References

[Wikipedia: Vignere Cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher)