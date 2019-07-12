
printf("Enter the master password:\n");
gets(userPass);

if(strncmp(userPass,MASTER_PASSWORD,9)==0){
    printf("PASSWORD VERIFIED\n");
}

