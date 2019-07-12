
printf("Enter the master password:\n");
fgets(userPass,9,stdin);

if(strncmp(userPass,MASTER_PASSWORD,9)==0){
    printf("PASSWORD VERIFIED\n");
}

