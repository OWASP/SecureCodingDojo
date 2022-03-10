Users entrust developers with their data. To earn and maintain their trust, we must employ security controls that protect data from unauthorized access. Confidentiality is one of three essential elements of Information Security, also known as the CIA triad (Confidentiality, Integrity and Availability).

Unfortunately the track record is not good. The number of user records exposed in the United States has been in the billions in the past few years.

There are programming flaws that specifically involve storage and transmission of data and they may be prevented during code review. They are as follows:

1. Cleartext Storage of Sensitive Information — CWE 312
2. Use of a One-Way Hash without a Salt — CWE 759
3. Cleartext Transmission of Sensitive Information — CWE 319
4. Use of a Broken or Risky Cryptographic Algorithm — CWE 327

We will review a few examples of these flaws and how they can be prevented through software security best practices.

#####Uniquely Identifying Data Without Knowing the Data

One of the strongest countermeasures that can be employed to prevent data breaches is not storing the data at all.
But what if you still need to work with the data? For example, what if you wanted to verify a user’s password without storing the actual password value?
You could transform the data in a non-reversible way. This can be done through a cryptographic operation known as hashing.
Hashing algorithms, such as the SHA-2 class of algorithms, convert data in a way that cannot be reversed. However this doesn’t prevent one from trying a large amount of possible values in order to reach the same outcome. This is known as cracking. Cracking takes a long time and requires a lot of computing resources. Hackers maintain lists of pre-computed hashes, known as rainbow tables, in order to avoid the computing cost.

The defence employed against rainbow tables is to complicate the calculation by adding a salt. A salt is a random value that is added to the data being transformed in order to alter the resulting hash.

    "ABCDEFG" + "-32524..." -> sha256("ABCDEFG-32524...") -> 97AF3...
    original     salt

Another defence against cracking is adaptive hashing. This involves re-hashing the data for a large amount of iterations, each iteration taking longer than the previous. This increases the computing time. For a single hash the time is negligible but for a cracking attack it results in millions of years. A largely adopted adaptive hashing algorithm is PBKDF2.

Secure hashing may be employed for various other types of data. For example if an application needs to uniquely identify users for analytics purposes, it could construct a unique, non-reversible hash from the user name and their IP address. This process is known as **Tokenization**.

If the website analytics database is breached and the only thing obtained by the attackers are these hashes, the data is useless to them or too costly to reverse. However if the database contains user names and if the user names are actual e-mails (a practice employed by many sites), then e-mails will be sold on the dark web to be used for phishing and spam campaigns.

#####Securing the Transmission of Data

Hashing can be an effective way to secure the data, but what if the attacker is able to intercept the data before it is transformed? What if they can intercept the data even before it reaches the application?

When a website uses clear text to communicate with its users, _man-in-the-middle_ attacks are possible. These attacks can be online or offline attacks. Offline attacks usually target the Confidentiality of the data, for example tracking a user’s activity online or stealing their credentials. Online attacks can also impact the Integrity of the data, like for example replacing the content of a trusted news outlet with malware.

Communication security protocols, indicated by `https://` URLs, prevent man-in-the-middle attacks by encrypting the transmission and verifying the identity of the two parties involved in the communication. There are many details to transmission security but one aspect that may come up during a code review is ensuring that `https://` URLs are used.

Sometimes developers change the code to ignore invalid certificates because the test environment they are using does not have a valid web server certificate. This is a bad practice because it practically violates the server identity verification and allows man-in-the-middle attackers to pretend they are the target website. It is recommended to configure the development environment to trust the test certificate instead of altering the program behaviour.

#####Reversible Encryption

What if you must be able to work with the user data in clear text? For example, you operate an online shopping or other financial site and must store the user’s name, address and credit card information to process transactions.

In these cases encryption can be effective, provided that the attackers cannot retrieve the encryption keys. If encryption keys are stored on a separate server, also known as a Key Management Server or Service (KMS), then attackers must obtain access to this server as well, which complicates the attack. However, if the encryption keys are stored alongside the encrypted data - such as both in the same database, or both in the same folder on the file system decrypting the data is trivial. This scenario is similar to _hiding a key under the mat_.

In this challenge you must examine three different examples and spot the code that correctly implements the code practices outlined below.
