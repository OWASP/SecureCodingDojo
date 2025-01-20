export JAVA_OPTS="-DCHALLENGE_MASTER_SALT=$CHALLENGE_MASTER_SALT"
su - www-data -s /bin/bash -c '/usr/local/tomcat/bin/catalina.sh run' -w JAVA_HOME,JAVA_OPTS