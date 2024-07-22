docker build -t securecodingdojo/redblueapp .
CHALLENGE_MASTER_SALT=$(openssl rand -hex 16)
echo $CHALLENGE_MASTER_SALT
docker run -p 8888:8888 -p 8080:80 -e MASTER_SALT="$CHALLENGE_MASTER_SALT" securecodingdojo/redblueapp
