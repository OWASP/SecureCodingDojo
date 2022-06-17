

char userPass[5];

printf("Enter the password:\n");
fgets(userPass,9,stdin);

if(strncmp(userPass,PASSWORD,BUFFER_SIZE)==0){
    printf("PASSWORD VERIFIED\n");
}

