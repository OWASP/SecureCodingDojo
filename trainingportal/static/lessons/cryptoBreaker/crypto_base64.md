
Base64 is a method of encoding binary data, including but not limited to text in binary form.
The binary data is taken six bits at a time and mapped to a list of 64 unique printable characters.
These characters are numerals of the Base64.

- Base2 contains two numerals: 0 and 1.
- Base10 contains ten numberals: 0-9.
- Base16 contains sixteen numberals: 0-9,A-F.
- Base64 contains 64 numerals: A-Z,a-z,0-9,+ and /.

#### Algorithm
- Split data in groups of 6 bits
- Map each group of bits to a numeral of the base64 set
- Use padding (=) to fill in empty spaces, when the data doesn't fit exactly in groups of 6 bits

##### Example
- ABCD becomes 65 66 67 68 in ASCII also represented as 0x41, 0x42, 0x43, 0x44 in hexadecimal (Base16)
- The binary (Base2) character sequence is 0100 0001, 0100 0010, 0100 0011, 0100 0100 (4 groups of 8 bits or 4 bytes)
- The sequence then is represented as 010000, 010100, 001001, 000011, 010001, 00 (5 groups of 6 bits, and 2 zero bites left)
- The Base64 representation for each of these codes is Q, U, J, D and R
- The Base64 representation for the last two bits is 00---- (A) with padding added for the empty spots
- The final code is QUJDRA==

##### Weakness
It can be easily deciphered using the well known base64 character map, regrouping the bites in bytes and then converting to the character encoding representation.

#### References

[Wikipedia: Base64](https://en.wikipedia.org/wiki/Base64)
