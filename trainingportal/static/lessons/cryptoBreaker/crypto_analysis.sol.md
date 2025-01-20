### Solution for "Cryptanalysis" challenge

This challenge puts together all types of text transformation techniques encountered so far.

You will leverage the fact that you are able to guess the starting line in the message. 

The HTTP protocol defines messages that follow the format below:

      {HTTP METHOD} {PATH} {PROTOCOL}\r\n
      {HEADER 1}:{VALUE 1}\r\n
      ...
      {HEADER N}:{VALUE N}\r\n
      \r\n
      {OPTIONAL BODY}
      \r\n


{HTTP METHOD} can be any of the following: GET, POST, HEAD, OPTIONS, PUT, DELETE, but most commonly GET and POST are used.

POST in particular is used to transmit data in the request body.

A typical request will look like this:
      
      POST /{path} HTTP/{version}


Path can be anything
Version can be 1.0, 1.1, 2 or more. However versions 2 and above are binary protocols so they are a bit more complicated for cryptanalysis.

HTTP/1.1 was the protocol of choice for a very long time so it's a good guess.

You could start with POST / and build up from it, but for the purpose of this challenge let's assume we can guess the entire request line from the start:

      POST / HTTP/1.1

Now you can remember the XOR challenge and the property of XOR below:

    A ^ B = C
    B ^ C = A
    A ^ C = B


##### Step 1 - Recover the key

Use a online tool to get the ASCII code for `POST / HTTP/1.1` **in hexadecimal**.


You will get something like this:
      
      50 4F 53 54 20 2F 20 48 54 54 50 2F 31 2E 31

This is only 15 bytes. Add `0D` (CR) to make it 16 bytes, which is a multiple of 2 and likely the length of the key.

      50 4F 53 54 20 2F 20 48 54 54 50 2F 31 2E 31 0D

Now **XOR** the assumed plain text with the cipher **as a hexadecimal key** and copy down the resulting first 16 bytes.

      41 35 BA 75 45 C3 A0 80 53 0E 5F 54 0A 05 13 CD


##### Step 2 - Recover the HTTP message


Now **XOR** the recovered key bytes with the cipher. Display the result as printable characters:

You will get something like the below.

       POST / HTTP/1.1
       Host: finance.biznis
       Content-length: 326
       
       kmb64=eyJrZXlNYXRlcmlhbFNoaWZ0ZWQiOiJHV01FWUZHIENTRFBBIFVNT0VJRCBFR1JJViBHR0NHTFcgUUNDSiBRQUNQWiBYQUNIRlYgWFRQVlZBIFdXU0lEWiIsImdvbGRlbktleVNoaWZ0SGFzaCI6ImE1MTZmZjc0ZTIyMmMzYmJkM2FiOTI0ZTk2ZmVmZTBjIiwiZ29sZGVuS2V5U2FsdEhhc2giOiJhOGQzMTM5ZTAwNzUyZjg4NzZlNDdiMmZiZGNlMDc0ZCIsImhhc2hpbmdGdW5jdGlvbiI6IlNIQTI1NiIsIml0ZXIiOjEwMDB9


##### Step 3 - Decode the kmb64 parameter

Decode the kmb64 parameter using an online base64 decoder.

Now we can see a JSON message similar to the example below:

       {
            "keyMaterialShifted":"GWMEYFG CSDPA UMOEID EGRIV GGCGLW QCCJ QACPZ XACHFV XTPVVA WWSIDZ",
            "goldenKeyShiftHash":"a516ff74e222c3bbd3ab924e96fefe0c",
            "goldenKeySaltHash":"a8d3139e00752f8876e47b2fbdce074d",
            "hashingFunction":"SHA256",
            "iter":1000
       }

##### Step 4 - Look-up the hashes

Using your online rainbow table of choice identify the Shift and the Salt hashes.

For the given example:

       a516ff74e222c3bbd3ab924e96fefe0c - LOREM
       a8d3139e00752f8876e47b2fbdce074d - VIVAMUS

##### Step 5 - Unscramble the key material using Vigenère

Using an online tool unscramble the text using the value associated with `goldenKeyShiftHash` as a key:

       GWMEYFG CSDPA UMOEID EGRIV GGCGLW QCCJ QACPZ XACHFV XTPVVA WWSIDZ
       VIVAMUS LOREM DICTUM AUGUE CURSUS EROS MORBI TORTOR LIBERO LIBERO


##### Step 6 - Generate the PBKDF2

Using an online tool generate a PBKDF2 key using the parameters associated with the JSON. 

For our example:

       Password:   VIVAMUS LOREM DICTUM AUGUE CURSUS EROS MORBI TORTOR LIBERO LIBERO
       Algorithm:  SHA256
       Salt:       VIVAMUS
       Iterations: 1000

The solution is the resulting hex value.

