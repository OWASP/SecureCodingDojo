
int len = 0, total = 0, CHUNK_SIZE = 16, BUFFER_SIZE = 256, chunks = 0;
char chunk[CHUNK_SIZE];
char buffer[BUFFER_SIZE];
while(1){
    fgets(chunk, CHUNK_SIZE, stdin);
    len = strnlen(chunk, CHUNK_SIZE);
    total += len;
    if(total <= MAX_SIZE){
        strncat(buffer, chunk, CHUNK_SIZE);
        chunks++;
    }
    else break;
}
