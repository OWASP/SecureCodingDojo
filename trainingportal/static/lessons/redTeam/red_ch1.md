Use nmap to scan for open ports of the provided host, identify applications running on each port, use Metaploit or a exploit script you find online to take advantage of the first vulnerability.

#### Getting setup
Here are instructions on how to get your pen-tester environment setup:

##### Nmap
Install nmap.

Once nmap is installed you can scan the target host with `nmap <target_host> -Pn -p-`

##### Metasploit
If you have Docker installed you can simply run the metasploit container image.


#### Instructions for Completing the Challenge
- Run nmap
- Run metasploit or a different exploit script to take advantage of a vulnerability in the first identified app
- Execute commands remotely
- Find the flag program in the current directory and use it to sign the challenge salt: `./flag <SALT>`