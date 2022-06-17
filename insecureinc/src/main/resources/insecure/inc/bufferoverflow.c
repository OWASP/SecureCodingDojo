#include <stdio.h>
#include <string.h>

int main(){
        char PASSWORD[9]="59563376";
        char userPass[9];
        int i;

        printf("Enter the password:\n");
        gets(userPass);

        printf("\nuserPass address: '%p'",&userPass);
        printf("\nuserPass contents:\n|");
        for(i=0;i<9;i++){
                printf("%02x|",userPass[i]);
        }
        printf("\n\nPASSWORD address: '%p'",&PASSWORD);
        printf("\nPASSWORD contents:\n|");
        for(i=0;i<9;i++){
                printf("%02x|",PASSWORD[i]);
        }

        if(strcmp(userPass,PASSWORD)==0){
                printf("\n\nPASSWORD VERIFIED\n");
        }
        else{
                printf("\n\nInvalid password!\n");
        }
        return 0;
}
