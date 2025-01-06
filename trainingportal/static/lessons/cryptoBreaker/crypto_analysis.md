Welcome to the final lesson of this module.

Cryptanalysis is the process of decrypting a cipher without knowing the key. We've briefly explored some forms of cryptanalysis so far, but now we get to put them all to work. 

Cryptanalysis has evolved over time alongside new ciphers being invented. In World War II, the British government brought together the brightest mathematicians in England to break the Enigma cipher. Alan Turing, one of the most influential minds in the development of computer science, was instrumental in cracking the cipher. He leveraged previous research by Polish cryptanalyst Jerzy Różycki to create a statistical analysis cracking technique called *Banburismus*.  

Some of the crypanalysis concepts that we have explored so far are:

- Cracking/Brute-Force: Trying all key combinations
- Frequency Analysis: Identifying patterns in the cipher. For example identifying the word `the` or the letter `e` for English texts
- Known Plain-Text: Leveraging a public piece of information about the cipher.

Another concept not yet covered is the `indicator`. The indicator is a special message exchanged by two parties in order to establish what key to use. Example of an indicator could be 42, which specifies that the two parties should use key number 42 from a list of keys known by both parties. To decrypt the cipher one would have to obtain the list of keys and locate number 42 in the list. In fact, the Enigma cracking efforts were greatly helped by a British commando unit who stole the keys used for the month of February. 

Another concept is the `depth`. Depth represents how many times the same key is used. The higher the depth the more data using the same key which increases the possibility of identifying patterns in the data. To reduce depth, keys need to be rotated frequently. 



#### About the Challenge

In this challenge you will have to leverage all the basic data transformation methods learned so far to decrypt "the golden key". There are multiple keys and algorithms being used. You will have to determine the keys and the algorithms.

You are given an intercepted cipher text for a client/server application. The intercepted message is an `indicator` which contains information about the golden key. It is being sent periodically to transmit a new the golden key which is then used to digitally sign transactions. The developers of the application have decided to implement a lightweigh message encryption algorithm because the application is used in financial transactions and has to have minimum latency.

**NOTE: Writing your own encryption algorithm or using known weak ciphers to improve performance is a known fallacy. Cryptographic algorithms such as AES 256, at this point in time, have a very strong mathematic foundation and have evolved over multiple iterations to optimize performance and resilience to attacks.**

You know that the application uses HTTP for communication. Having this insight you must determine the key and extract a randomly generated golden key from the message. 

The golden key is wrapped in several layers of encoding so you will need to recognize all types of transformations leading to the final value.

#### Challenge Tips

- Go back and read some of the previous lessons. They contain information that will help with this challenge.
- HTTP is a well known communication protocol, there are many common words. Keep trying until you reconstruct most of the key.
- If you recover part of the encryption key, pad the missing bytes with 0x0. This way when the key repeats you can uncover more of the message.
- In one of the previous lessons you've decrypted a key using the plain text and the cipher. That should point you to what algorithm is being used.
- Once you uncover more of the message, or you are able to infer the text, add the correct bytes to the key. Then copy the resulting longer key to a file and identify the repeating bytes.

Example:

     //You uncovered the following key bytes: `1 2 3 4`. Now the message looks like this
     "PLAIJ#UB]S"
     //Add a 0 to the key: `1 2 3 4 0`. Now the message looks like this
     "PLAIK TEXQ"
     //Now you can probably guess the message but let's assume for the sake of the example that you only know 'TEXT' which gives you the last byte in the sequence `5`. Write all the bytes together
     `1 2 3 4 0 1 2 3 4 5`
     //Now identify the repeating bytes
     `1 2 3 4 0`
     `1 2 3 4 5`
     //Replace `0` with `5` and apply the new key below to the cipher.
     `1 2 3 4 5 1 2 3 4 5`
     //Now you are able to decrypt the message
     "PLAIN TEXT"
     //Note that you don't need to repeat the byte sequence. You can simply use `1 2 3 4 5` as the key.
    
In our example we used a 5 byte key, however key sizes are usually multiples of 2: 16 bytes, 32 bytes, 64 bytes. Start with 16 and go to higher lengths if needed.


#### References

- [Wikipedia: Cryptanalysis](https://en.wikipedia.org/wiki/Cryptanalysis)
- [Wikipedia: Cryptanalysis of the Enigma](https://en.wikipedia.org/wiki/Cryptanalysis_of_the_Enigma)