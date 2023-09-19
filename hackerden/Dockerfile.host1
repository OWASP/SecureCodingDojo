# Copyright 2023 VMware, Inc.
# SPDX-License-Identifier: Apache-2.0	
FROM alpine:latest
RUN apk add --update --no-cache openssh curl
RUN apk upgrade

RUN echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config
RUN adduser -h /home/coinminer -s /bin/sh -D coinminer
RUN echo -n 'coinminer:coinminer' | chpasswd
RUN echo "#!/bin/sh" > "/entrypoint.sh"
RUN echo "ssh-keygen -A" >> "/entrypoint.sh"
RUN echo 'exec /usr/sbin/sshd -D -e "$@"' >> "/entrypoint.sh"
RUN chmod +x "/entrypoint.sh"
EXPOSE 22
ENTRYPOINT ["/entrypoint.sh"]

