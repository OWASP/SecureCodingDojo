FROM drupal:8.5.0

RUN apt-get update
RUN apt-get -y install supervisor
RUN apt-get -y install iputils-ping

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf 

COPY drupal-8.5.0 /var/www/html
RUN mkdir /opt/net-diag
COPY net-diag /opt/net-diag
COPY drupal-8.5.0 /var/www/html
WORKDIR /var/www/html

RUN set -eux; \
	chown -R www-data:www-data sites modules themes

ENTRYPOINT ["/usr/bin/supervisord"]
