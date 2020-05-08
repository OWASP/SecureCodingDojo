#include <stdlib.h>
#include <iostream>
#include <sstream>
#include <string.h>
#include <iomanip>
using namespace std;

#include <openssl/sha.h>

// Taken from https://stackoverflow.com/a/7577229

string sha256(string line) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, line.c_str(), line.length());
    SHA256_Final(hash, &sha256);

    stringstream ss;
    for(int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << hex << setw(2) << setfill('0') << (int) hash[i];
    }
    return ss.str();
}

int main(int argc, char *argv[]) {
    char* master_salt = getenv("MASTER_SALT");
    string challenge_id = "red_ch2";
    if(master_salt==NULL || strlen(master_salt)==0) {
	    cout << "Misconfigured environment. Exiting ..." << endl;
	    return 1;
    }
    if(argc==2) {
        string to_hash = challenge_id + string(argv[1]) + string(master_salt);
        string sha256hash = sha256(to_hash);
        cout << sha256hash;
        return 0;
    }
    else {
        cout << argc-1 << " input arguments provided." << endl;
        cout << "Exactly 1 input argument needs to be supplied:" << endl;
        cout << "USAGE: $./flag_sign <USER_SALT>" << endl;
        return 1;
    }
}
