
int BUFFER_SIZE = 9;
char userPass[BUFFER_SIZE];

printf("Enter the password:\n");
fgets(userPass,BUFFER_SIZE,stdin);

if(strncmp(userPass,PASSWORD,BUFFER_SIZE)==0){
    printf("PASSWORD VERIFIED\n");
}

