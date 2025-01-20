### Solution for "Vigenère" challenge

Use an online tool to unscramble the text.

Some online tools perform frequency analysis on the cipher. Given the correct language they will find the key automatically.

However to assist with this challenge, the given plain text always begins with `LOREM`.

This should help you figure out the key pretty easily even without using an online tool and also recognize the correct solution if given several options.

For example, in the previous challenge we arrived at LOREM with two shifts to the left in the Latin alphabet:

       NQTGO 
    <- MPSFN 
    <- LOREM 

Given a Vigenère cipher that begins with **LPTEN**, we can infer the key is `ABC`. 
      
      `Cipher`:   L  P  T  E  N
      `A`:       >L< O  R >E< M
      `B`:        M >P< F  S >N<
      `C`:        N  Q >T< G  O

     
