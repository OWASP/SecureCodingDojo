FROM drupal:8.5.0

RUN apt-get update
RUN apt-get -y install supervisor
RUN apt-get -y install iputils-ping
RUN apt-get -y install libssl-dev

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf 

COPY drupal-8.5.0 /var/www/html
RUN mkdir /opt/net-diag
COPY net-diag /opt/net-diag
COPY drupal-8.5.0 /var/www/html

RUN cd /var/www/html/ && g++ red_ch1.cpp -lcrypto -o red_ch1.flag
RUN cd /opt/net-diag/ && g++ red_ch2.cpp -lcrypto -o red_ch2.flag

WORKDIR /var/www/html

RUN set -eux; \
	chown -R www-data:www-data sites modules themes

ENTRYPOINT ["/usr/bin/supervisord"]
