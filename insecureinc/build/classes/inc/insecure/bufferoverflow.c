#include <stdio.h>
#include <string.h>

int main(){
	char MASTER_PASSWORD[9]="59563376";
	char userPass[9];

	printf("Enter the master password:\n");
	gets(userPass);

	if(strcmp(userPass,MASTER_PASSWORD)==0){
		printf("PASSWORD VERIFIED\n");
	}
	else{
		printf("Invalid password!\n");
	}
	return 0;
}
