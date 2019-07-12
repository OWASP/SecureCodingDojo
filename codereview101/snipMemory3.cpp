
int BUFFER_SIZE = 9;
char userPass[BUFFER_SIZE];

printf("Enter the master password:\n");
fgets(userPass,BUFFER_SIZE,stdin);

if(strncmp(userPass,MASTER_PASSWORD,BUFFER_SIZE)==0){
    printf("PASSWORD VERIFIED\n");
}

