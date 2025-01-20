echo "user=admin" > /etc/credentials.properties
echo password=$(openssl rand -hex 32) >> /etc/credentials.properties
openssl rand -out /etc/commandauth.bin 128
export JAVA_OPTS="-DSECRET2=FLAG-xxe-$FLAG_SECRET -DSECRET3=FLAG-deserialization-$FLAG_SECRET "
su - www-data -s /bin/bash -c '/usr/local/tomcat/bin/catalina.sh run' -w JAVA_HOME,JAVA_OPTS