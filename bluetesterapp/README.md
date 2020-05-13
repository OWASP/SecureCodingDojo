#Blue Team Tester Application
This application should be used to test the blue teamers security coverage of the vulnerable container deployed in the Red Team / Blue Team training modules.

The user input the vulnerable container ip address and the challenge salt.

The tester will launch a specially crafted payload to the vulnerable application, triggering certain rule of the intrusion prevention module of Deep Security.

The blue teamers should look in the data section of the IPS rule for the flag.

##Building & Running

Take a look in `buildAndRun.sh`
