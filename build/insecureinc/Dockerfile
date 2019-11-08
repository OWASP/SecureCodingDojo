FROM tomcat:8.5-jre8
RUN rm -rf /usr/local/tomcat/webapps/ROOT
COPY InsecureInc.war /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8080
RUN  rm -rf /var/lib/apt/lists/* && \
    apt-get update --fix-missing && \
    apt-get -y install gcc
   