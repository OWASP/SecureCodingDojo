/* 
    Copyright 2023 VMware, Inc.
    SPDX-License-Identifier: Apache-2.0	
*/
listBucket = (req, res) => {
    res.setHeader('Content-type', 'text/xml');
    let responseXML = `<?xml version="1.0" encoding="UTF-8"?>
    <ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
        <Name>scd-c2</Name><Prefix></Prefix><Marker></Marker><MaxKeys>1000</MaxKeys>
        <IsTruncated>false</IsTruncated>
        <Contents><Key>secret.txt</Key><LastModified>2023-06-07T15:24:36.000Z</LastModified><ETag>&quot;9f00fa953c30966bf2c361b01ab60cab&quot;</ETag><Size>16</Size><Owner><ID>scd</ID><DisplayName>scd</DisplayName></Owner><StorageClass>STANDARD</StorageClass></Contents>
        <Contents><Key>messages/</Key><LastModified>2023-06-07T15:24:36.000Z</LastModified><ETag>&quot;9f00fa953c30966bf2c361b01ab60cab&quot;</ETag><Size>16</Size><Owner><ID>scd</ID><DisplayName>scd</DisplayName></Owner><StorageClass>STANDARD</StorageClass></Contents>
        <Contents><Key>chat/</Key><LastModified>2023-06-07T15:24:36.000Z</LastModified><ETag>&quot;9f00fa953c30966bf2c361b01ab60cab&quot;</ETag><Size>16</Size><Owner><ID>scd</ID><DisplayName>scd</DisplayName></Owner><StorageClass>STANDARD</StorageClass></Contents>
    </ListBucketResult>
    `
    res.send(responseXML)
}

listChatFolder = (req, res) => {
    res.setHeader('Content-type', 'text/xml');
    let responseXML = `<?xml version="1.0" encoding="UTF-8"?>
    <ListBucketResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
        <Contents><Key>chatUsers.json</Key><LastModified>2023-06-07T15:24:34.000Z</LastModified><ETag>&quot;b40064d8a0c616639625dd2788b0a4db&quot;</ETag><Size>354</Size><Owner><ID>scd</ID><DisplayName>scd</DisplayName></Owner><StorageClass>STANDARD</StorageClass></Contents>
        <Contents><Key>cncChat.css</Key><LastModified>2023-06-07T15:24:35.000Z</LastModified><ETag>&quot;9c3948279137ca3194a3ef103d39a0cd&quot;</ETag><Size>508358</Size><Owner><ID>scd</ID><DisplayName>scd</DisplayName></Owner><StorageClass>STANDARD</StorageClass></Contents>
        <Contents><Key>cncChat.html</Key><LastModified>2023-06-07T15:24:35.000Z</LastModified><ETag>&quot;c407c85c2dc8bb901e8cf8041222fbbf&quot;</ETag><Size>10832</Size><Owner><ID>scd</ID><DisplayName>scd</DisplayName></Owner><StorageClass>STANDARD</StorageClass></Contents>
        <Contents><Key>messages.json</Key><LastModified>2023-06-07T15:24:34.000Z</LastModified><ETag>&quot;d663f1f40451dd745d91b8faba273e28&quot;</ETag><Size>476</Size><Owner><ID>scd</ID><DisplayName>scd</DisplayName></Owner><StorageClass>STANDARD</StorageClass></Contents>
    </ListBucketResult>`

    res.send(responseXML)

}

module.exports = {
    listBucket,
    listChatFolder
}