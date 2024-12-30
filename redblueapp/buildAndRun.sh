docker build -t securecodingdojo/redblueapp .
docker run -p 8888:8888 -p 8080:80 -e MASTER_SALT="$CHALLENGE_MASTER_SALT" securecodingdojo/redblueapp
