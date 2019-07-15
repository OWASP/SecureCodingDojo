Memory related vulnerabilities are very dangerous. They are often classified as 0-days. 0-days are vulnerabilities in common software leveraged by malware and viruses. Essential operating system components and programs such as system services, browsers, crypto libraries and document readers are written in C/C++ and are particularly exposed to these types of flaws.

There are many flavours of memory vulnerabilities but we will focus on the most common mistakes:

1. Buffer Copy without Checking Size of Input — CWE 120
2. Incorrect Calculation of Buffer Size — CWE 131
3. Off by One — CWE 193
4. Uncontrolled Format String — CWE 134

How do we know they are the most common? All of these mistakes are documented by MITRE with the top 3 being included in the MITRE Sans Top 25.
They all lead to arbitrary access of memory outside the intended boundaries. This is also known as **Overflow**. 

**Overflow** can be prevented by controlling the number of characters read into the buffer. This is done using **memory safe functions**. Here are a few memory safe functions:

    fgets(dest_buff, BUFF_SIZE, stdin);
    snprintf(dest_buff, BUFF_SIZE, format, ...);
    strncpy(dest_buff, src_buff, BUFF_SIZE);
    strncmp(buff1, buff2, BUFF_SIZE);

It is important to note that simply using these functions will not prevent overflow. They also must be used correctly. If the `BUFF_SIZE` argument is larger than the size of the buffer, overflow will still occur. This is an example of **Incorrect Calculation of Buffer Size**. **Defining constants for the size argument** rather than using numerals and paying close attention during code review to the code checking boundaries, can prevent this type of flaw. 

Another variation of buffer size flaw is **Off-by-one**. This type of programming mistake is introduced when employing comparison operators. A simple extra equal sign, for example using `<=` instead of `<` can lead to the program crashing.

Last but not least **Format String Injection** is a type of vulnerability caused by concatenating or using user input in a format parameter. Code that logs user values using functions such as `printf` is particularly exposed to this type of vulnerability.

In this challenge you must examine code samples for each of the four memory flaws and select the snippet that prevents the vulnerability. 