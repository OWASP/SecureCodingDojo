
A password based key can be used to make a human chosen secret harder to guess. For example applying a key derivation function to a simple word like: `balloon` generates the 256 bits/32 bytes key: 

      35 1D A6 E0 E2 14 22 72 80 A4 19 3B 2B C4 BC 49 F7 82 AA C2 F3 EC 63 00 51 D9 8C 84 5C A6 33 4A

This newly derived key can be used to generate a cipher that is much harder to break with cryptanalysis.

In comparison if we were to use `balloon` as is the key would be:

      62 61 6C 6C 6F 6F 6E

Such a short key would increase the likelihood of repeated patterns in the cipher, allowing for the identification of common letters and common words.

The process of turning a simple passphrase into a more complex key is also known as `key stretching`.

#### Algorithm

There are 3 well known classes of password based key derivation algorithms:

- PBKDF: stands for Password Based Key Derivation Function, also used in the WPA wireless protocol
- BCRYPT: more resistant to cracking because it requires more memory
- SCRYPT: newer algorithm that is also resistant to dedicated cracking circuits

The PBKDF2 algorithm combines the password with a given salt and then applies a hashing function such as SHA-256 for a given amount of iterations.

The more iterations, the more compute intensive it is to crack the password. The salt introduces variability, making the password less likely to be found in a precomputed hash table.

Password based key derivation functions are ideal for password storage as they can make cracking passwords impractical even for dictionary words.

##### Example

Algorithm: `PBKDF2`

- Using `pass` as the password and `salt` as the salt
- Execute a hashing function such as `SHA256` on the password and the salt

        `H1` = HASH ( `pass`, `salt` )

- Execute the same hashing function again on the password with the previous hash as a salt

        `H2` = HASH ( `pass`, `H1` )

- Repeat by the number of iterations (For our example we will stop at 2 iterations)
- `XOR` the values for all iterations together

        `KEY` = `H1` ^ `H2` 

The wireless protocol WPA2 uses the following key derivation function:

      DK = PBKDF2(SHA1, passphrase, ssid, 4096, 256) //4096 iterations, and 256 bits key length

Do you see any issues with the provided arguments?

##### Weaknesses

A PBK is as strong as the arguments given to the derivation function. If someone uses `password` and `salt` to generate a key, the likelihood a pre-computed hashes existing for all iterations increases.

If the salt is known to the attacker that also makes the password easier to crack. In the case of WPA2 the ssid is broadcasted and visible to all your neighbours.

Using a weak hashing algorithm may allow collisions, although the attacker would need to know the final key for the collision vulnerabilities to com into play. The bigger concern is that some algorithms such as MD5 may impose a shorter length key (16 bytes). A shorter key is easier to crack and increases the avenues for cyptanalysis. 


#### References

[Wikipedia: PBKDF2](https://en.wikipedia.org/wiki/PBKDF2)



