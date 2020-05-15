Review container scanner results for a different type of vulnerability that may allow lateral movement to an AWS lambda function

#### Instructions for Completing the Challenge

- Find the sensitive information
- Use this information to authenticate to the Lambda funcion and sign your challenge salt

##### Tip
To view files in the docker container you can do the following:

- Use `docker ps` to obtain the container id
- Use `docker exec <container_id> ls -la <dir>` to do a directory listing. 
- Use `docker exec <container_id> cat <file_path>` to view the contents of a file