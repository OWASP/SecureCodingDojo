FROM node:lts-jessie
COPY *.zip /tmp
RUN unzip -o /tmp/*.zip -d /home/node/app/
RUN rm -f /tmp/*.zip
COPY config.js /home/node/app/config.js
COPY challengeSecrets.json /home/node/app/challengeSecrets.json
RUN npm install -g node-pre-gyp
RUN cd /home/node/app && npm rebuild
EXPOSE 8081
ENTRYPOINT ["node","/home/node/app/server.js"]
