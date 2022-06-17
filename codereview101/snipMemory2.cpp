
printf("Enter the password:\n");
gets(userPass);

if(strncmp(userPass,PASSWORD,9)==0){
    printf("PASSWORD VERIFIED\n");
}

