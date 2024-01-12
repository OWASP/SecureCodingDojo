/* 
    Copyright 2023 VMware, Inc.
    SPDX-License-Identifier: Apache-2.0	
*/
const {Client} = require('ssh2');
const challengeCode = require('./challenge-code')


const FLAG1 = "FLAG-injection"
const FLAG2 = "FLAG-xxe-"+process.env.FLAG_SECRET
const FLAG3 = "FLAG-deserialization-"+process.env.FLAG_SECRET



ping = (req,res)=> {
    var hostname = req.body.hostname
    var ssh = new Client();

    if(typeof hostname === 'undefined'){
        return res.send({"errorMessage":"Malformed JSON. Missing hostname."});
    }
    //this deny list can likely be bypassed, is mainly here to make it harder to cheat than to pass the real challenges
    hostname = hostname.replace("''","")    
    hostname = hostname.replace('""',"")
    const disallowedPatterns = /(FLAG|passwd|shadow|echo|\bsed\b|print|base64|\bxxd\b|\b(chmod|rm|mv|cp)\b)/;
    if (disallowedPatterns.test(hostname)) {
        console.log(`Bypass attempt with ${hostname}`);
        res.status(400);
        return res.send("Certain commands have been disallowed. There is a better way.");
    }
    
    
    console.log(`Trying to connect to ${process.env.COINMINER_SSH_HOST}`);
    ssh.on('ready',()=>{    
        var stdout = ""
        var stderr = ""
        var cmd = `rm -fr -- *;echo ${FLAG1} > secret.txt; echo "#run with docker run -it -p 8080:8080 securecodingdojo/hackerden-host2\ncurl ${process.env.COMMAND_PROC_URL} -i -L" > connecttocommandproc.sh; ping -c 1 ${hostname}`
        ssh.exec(cmd, 
        (err,stream) => {

            if(err) {
                console.log(err)
                return res.send({"errorMessage":"Connection error"})

            } 

            stream.on('close', async(code,signal)=>{
                
                var out = ""
            
                out += stderr
                
                out += stdout.trim()+"\n";
                
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