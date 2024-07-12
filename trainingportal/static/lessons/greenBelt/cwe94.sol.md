### Solution for "Improper Control of Generation of Code ('Code Injection')" challenge

When a system inserts external input into an engine that is capable of executing code, the input can exploit this fact by executing code that will accomplish some goal unintended by the system creator.
External input should never be trusted as it may actually be executable code.
Always apply server side input validation to external input to help protect against code injection.

To pass this challenge: 

- Become familiar with the Insecure Inc. Calculator and study the code snippet in the challenge description.
- Obtain the value for the password that is loaded into the runtime environment.
- Invoke the `deleteHistory` utility, providing the correct password.