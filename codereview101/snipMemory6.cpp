
int len = 0, total = 0;
while(1){
    fgets(buff1, MAX_SIZE, stdin);
    int len =  strnlen(buff1, MAX_SIZE);
    total += len;
    if(total < MAX_SIZE) strncat(buff2, buff1, len);
    else break;
}

