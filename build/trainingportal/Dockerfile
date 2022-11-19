FROM node:18-alpine

RUN apk --no-cache add --update g++ gcc libgcc libstdc++ linux-headers make jpeg-dev cairo-dev giflib-dev pango-dev
RUN apk --no-cache add --update python3 && ln -sf python3 /usr/bin/python
RUN apk --no-cache add msttcorefonts-installer fontconfig && \
    update-ms-fonts && \
    fc-cache -f
RUN apk upgrade

COPY *.DOCKER.zip /tmp
RUN unzip -o /tmp/*.zip -d /home/node/app/
RUN rm -f /tmp/*.zip
COPY config.json /home/node/app/config.json
WORKDIR /home/node/app

RUN npm install

EXPOSE 8081
ENTRYPOINT ["node","/home/node/app/server.js"]
