
A cryptographic hash function is a way of computing a code for a chunk of data. This code is also called a `digest`.

A secure cryptographic hashing algorithm has the following properties:

- It cannot be reversed (one-way only)
- It consistenly produces the same digest for the same data
- It is unique for the provided data 
- A small change in the data produces a significantly different digest

Hash functions are being used in a variety of applications: 

- Validating the integrity of a file or a message
- Storing a password 
- Generating a cryptographic key from a password

#### Algorithm
There are several classes of hashing algorithms: MD5, SHA1, SHA2, BLAKE. 

MD5 and SHA1 are known to be vulnerable.

Most algorithms leverage the characteristics of the data to arrive at a unique value.

##### Example

- Using MD5 "ABCD" becomes cb08ca4a7bb5f9683c19133a84872ca7
- Using MD5 "ABCE" becomes 6b011b774af5377cba2ec2b8ecd0b63b

##### Weaknesses

Digests can be pre-calculated making them as easy to reverse as an ASCII code. Indeed websites like `crackstation.net` or `hashes.com` contain large databases of pre-calculated digests also known as rainbow tables. The best way to prevent reversing hashed words is to concatenate a random string to the text. This is known as adding a salt. Another mitigation involves hashing the message several times (adding iterations). This increases the amount of computations necessary to calculate the hash.

Hashing algorithms are also vulnerable to collision attacks. Such attacks involve altering the input to arrive at the same digest. This is particularly dangerous when using hashing functions to ensure the integrity of executable files. Both MD5 and SHA1 algorithms are vulnerable to collision attacks.

#### References

[Wikipedia: Cryptographic Hash Function](https://en.wikipedia.org/wiki/Cryptographic_hash_function)