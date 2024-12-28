XOR encryption is a very fast encryption method that leverages the `eXclusive OR` boolean operation.

XOR outputs true whenever the inputs differ:

    A   B   C
    0 ^ 0 = 0
    0 ^ 1 = 1
    1 ^ 0 = 1
    1 ^ 1 = 0


XOR has the property that the result can be reversed to obtain the value of the inputs. This is useful for encryption.

    A ^ B = C
    B ^ C = A
    A ^ C = B

#### Algorithm

- A key is chosen. This key can be a text or it can be binary
- Perform a bitwise xor operation between each block of input data end each block of key data. 
- To decrypt perform the same operation in reverse, applying the key to the cipher.

##### Example

ABCD is 65 66 67 68 in ASCII code.

The binary (Base2) character sequence is 0100 0001, 0100 0010, 0100 0011, 0100 0100

Let's choose E as the key. E is `0100 0101`.

     0100 0001 ^ 0100 0101 = 0000 0100 (0x04)
     0100 0010 ^ 0100 0101 = 0000 0111 (0x07)
     0100 0011 ^ 0100 0101 = 0000 0110 (0x06)
     0100 0100 ^ 0100 0101 = 0000 0001 (0x01)

##### Weaknesses
If the attacker controls the input, they may easily derive the key by feeding the cryptographic function an array of 0s. 

Even if the attacker doesn't control the input, if they can guess one message and have the cipher for that message, then they will be able to obtain the key and decrypt all subsequent messages.

The algorithm is also succeptible to frequency analysis as similar encrypted blocks will look the same encrypted.

Finally if the key is poorly chosen, as in the example above, the key can be brute forced: meaning the attacker will try all possible key combinations. In the case of a key size of 1 byte, there are 256 combinations.