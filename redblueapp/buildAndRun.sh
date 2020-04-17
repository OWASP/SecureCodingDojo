docker build -t securecodingdojo/redblueapp .
docker run -p 8888:8888 -p 8080:80  securecodingdojo/redblueapp