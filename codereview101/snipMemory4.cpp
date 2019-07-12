

char userPass[5];

printf("Enter the master password:\n");
fgets(userPass,9,stdin);

if(strncmp(userPass,MASTER_PASSWORD,BUFFER_SIZE)==0){
    printf("PASSWORD VERIFIED\n");
}

