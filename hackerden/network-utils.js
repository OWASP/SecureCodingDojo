/* 
    Copyright 2023 VMware, Inc.
    SPDX-License-Identifier: Apache-2.0	
*/
const {Client} = require('ssh2');
const challengeCode = require('./challenge-code')


const FLAG1 = "FLAG-injection"
const FLAG2 = "FLAG-xxe"
const FLAG3 = "FLAG-deserialization"



ping = (req,res)=> {
    var hostname = req.body.hostname
    var ssh = new Client();

    if(typeof hostname === 'undefined'){
        return res.send({"errorMessage":"Malformed JSON. Missing hostname."});
    }
    if(hostname.indexOf(FLAG1) > -1||
       hostname.indexOf(FLAG2) > -1||
       hostname.indexOf(FLAG3) > -1||
       hostname.indexOf("passwd") > -1||
       hostname.indexOf("xxd") > -1||
       hostname.indexOf("echo") > -1||
       hostname.indexOf("tomcat") > -1||
       hostname.indexOf("base64") > -1||
       hostname.indexOf("rm ") > -1||
       hostname.indexOf("chmod  ") > -1||
       hostname.indexOf("mv ") > -1){
        return res.send("CLEVER!. Not allowed :)");
    }
    
    
    console.log(`Trying to connect to ${process.env.COINMINER_SSH_HOST}`);
    ssh.on('ready',()=>{    
        var stdout = ""
        var stderr = ""
        var cmd = `rm -fr *;echo ${FLAG1} > secret.txt; echo "curl ${process.env.COMMAND_PROC_URL} -i -L" > connecttocommandproc.sh; ping -c 1 ${hostname}`
        ssh.exec(cmd, 
        (err,stream) => {

            if(err) {
                console.log(err)
                return res.send({"errorMessage":"Connection error"})

            } 

            stream.on('close', async(code,signal)=>{
                
                if(stderr !== ""){
                    return res.send(stderr)
                }
                
                var out = stdout.trim()+"\n";
                
                var challengeId = null;
                var secret = null;
                if(out.indexOf(FLAG1) > -1){
                    challengeId="owasp2017injection";
                    secret=FLAG1;
                }
                if(out.indexOf(FLAG2) >-1){
                    challengeId="owasp2017xxe";
                    secret=FLAG2;
                }
                if(out.indexOf(FLAG3) >-1){
                    challengeId="owasp2017deserialization";
                    secret=FLAG3;
                }
                
                if(challengeId!==null){
                        console.log("Getting challenge code");
                        let challengeResponse = await challengeCode.getChallengeUrl(challengeId)
    
                        out = out.replace(secret,challengeResponse.challengeCodeUrl);
                        //remove all secrets from response
                        out = out.replace(FLAG1,"");
                        out = out.replace(FLAG2,"");
                        out = out.replace(FLAG3,"");
                        res.send(out);
                }
                else{
                        console.log("Did not pass challenge yet");
                        res.send(out);
                }
                ssh.end();
            }).on('data',(data)=>{
                stdout += data
            }).stderr.on('data',(data)=>{
                stderr+=data
            })

        })
    }) 
    .connect({
        host: process.env.COINMINER_SSH_HOST,
        port: 22,
        username: 'coinminer',
        password: 'coinminer'
    });
    
};
module.exports = {
    ping
}