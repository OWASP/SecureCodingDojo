FROM tomcat:8.5-jre8
COPY InsecureInc.war /usr/local/tomcat/webapps/insecureinc.war
EXPOSE 8080
RUN apt-get update && \
    apt-get -y install gcc && \
    rm -rf /var/lib/apt/lists/*