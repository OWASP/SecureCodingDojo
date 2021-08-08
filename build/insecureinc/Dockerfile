# Please use buildImage.sh script to build this image.
# This stage is compiling the code and packaging war file in target folder
FROM maven:3.8.1-openjdk-8 as build_image
ADD insecureinc /insecureinc
RUN cd /insecureinc && mvn clean install

FROM tomcat:8.5-jre8
RUN rm -rf /var/lib/apt/lists/* && \
    apt-get update --fix-missing &&\
    apt-get -y install gcc
RUN rm -rf /usr/local/tomcat/webapps/ROOT
# Copying insecure-inc-1.0.war from the build_image phase, rest everyting from last phase is discarded
COPY --from=build_image /insecureinc/target/insecure-inc-1.0.war /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8080
