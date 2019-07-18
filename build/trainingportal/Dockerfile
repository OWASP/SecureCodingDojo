FROM node:lts-jessie
COPY *.DOCKER.zip /tmp
RUN unzip -o /tmp/*.zip -d /home/node/app/
RUN rm -f /tmp/*.zip
COPY config.json /home/node/app/config.json
RUN cd /home/node/app && npm install
EXPOSE 8081
ENTRYPOINT ["node","/home/node/app/server.js"]
