docker build -t securecodingdojo/testerapplication .
docker run -p 8081:8081 -e MASTER_SALT="$CHALLENGE_MASTER_SALT" securecodingdojo/testerapplication
