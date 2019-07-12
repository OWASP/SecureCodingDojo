
var transaction = {"custName":custName,"address":custAddress,"creditCardNumber":dataCleaner.removeCCPAN(custCC)};
var encTransaction = cryptUtils.AES256GCM(transaction, secretsManager);
s3.putObject({
    "Bucket": "ACME-customer-billing",
    "Key": "todayTransactions",
    "Body": JSON.stringify(encTransaction),
    "Content-Type": "application/json"
},
function(err,data){
});
