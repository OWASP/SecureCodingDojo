#include <stdio.h>
#include <string.h>

int main(){
        char MASTER_PASSWORD[9]="59563376";
        char userPass[9];
        int i;

        printf("Enter the master password:\n");
        gets(userPass);

        printf("\nuserPass address: '%p'",&userPass);
        printf("\nuserPass contents:\n|");
        for(i=0;i<9;i++){
                printf("%02x|",userPass[i]);
        }
        printf("\n\nMASTER_PASSWORD address: '%p'",&MASTER_PASSWORD);
        printf("\nMASTER_PASSWORD contents:\n|");
        for(i=0;i<9;i++){
                printf("%02x|",MASTER_PASSWORD[i]);
        }

        if(strcmp(userPass,MASTER_PASSWORD)==0){
                printf("\n\nPASSWORD VERIFIED\n");
        }
        else{
                printf("\n\nInvalid password!\n");
        }
        return 0;
}
