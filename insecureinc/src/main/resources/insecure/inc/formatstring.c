#include <stdio.h>
#include <string.h>

int main(){
	char MASTER_PASSWORD[9]="582957";
	char userPass[9];
	int x=2;
	printf("Enter the master password:\n");
	fgets(userPass,9,stdin);

	if(strcmp(userPass,MASTER_PASSWORD)==0){
		printf("PASSWORD VERIFIED\n");
	}
	else{
		printf("Invalid password:");
		printf(userPass);
	}
	return 0;
}
