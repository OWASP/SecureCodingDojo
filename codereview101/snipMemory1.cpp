
printf("Enter the password:\n");
fgets(userPass,9,stdin);

if(strncmp(userPass,PASSWORD,9)==0){
    printf("PASSWORD VERIFIED\n");
}

