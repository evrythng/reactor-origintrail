# reactor-origintrail

This Reactor Extension script is part of 
[EVRYTHNG's Blockchain Integration Hub](https://developers.evrythng.com/docs/blockchain-integration-hub). 
It allows you to verify or share [EVRYTHNG](https://evrythng.com) actions on the
blockchain via the [OriginTrail](https://origintrail.io/) decentralized protocol.

This `README.md` focuses on the basic parameters. To learn more, have a quick 
look at our 
[OriginTrail Reactor Extension quickstart](https://developers.evrythng.com/docs/origintrail).


## Configure

* Get credentials for the OriginTrail node, and add them to `main.js`.
* Create the  `OUTPUT_ACTION_TYPE` (use the default, or your choice) action type
  in the EVRYTHNG project.
* Deploy this Reactor script in an application within that project, not
  forgetting to specify the `dependencies` in `package.json`.


## Use

The script will react to actions with a `createOriginTrail=true` custom field
on a Thng, product, or collection, and create a blockchain transaction for the
action using the specified OriginTrail node.

EVRYTHNG offers managed blockchain nodes to its Enterprise customers.
Our OriginTrail Enterprise nodes are accessible via 
`https://origintrail.evrythng.io`. [Contact us](https://evrythng.com/contact-us/) 
if you would like to use these managed nodes.

In addition to the triggering custom field above, other fields should be
specified to set the sender and receiver details in each OriginTrail
transaction:

* `senderName` - Sending company name.
* `senderEmail` - Sending company email.
* `receiverName` - Receiving company name.
* `receiverEmail` - Receiving company email.

The result will include the transaction ID from the blockchain
and will be added to a new confirmation action (as specified by
`RESULT_ACTION_TYPE`).


## Replication

By default, transactions to the specified OriginTrail node are kept on that node
so that they can be recalled in the smallest possible time. If you require the
data to be replicated to other OriginTrail nodes on the network, include the
`replicateOriginTrail=true` custom field in the original action. See below for
an example.


## Testing

Once the script is installed, test it by creating an action with the correct
custom fields specified on a Thng/product/collection in the project's scope, for
example:

```json
{
  "type": "_ItemShipped",
  "thng": "UKn4wYKEYyQnc2aawGhytBfc",
  "customFields": {
    "createOriginTrail": true,
    "replicateOriginTrail": true,
    "senderName": "EVRYTHNG",
    "senderEmail": "otnode@evrythng.com",
    "receiverName": "OriginTrail",
    "receiverEmail": "hello@origintrail.io"
  }
}
```

The resulting confirmation action output by the script will contain important 
information from the OriginTrail API (`importRes`) as well as information about
replication if requested (`replicationRes`):

```json
{
  "id": "U5nHbb84reSPeGaRampWfpTk",
  "type": "_originTrailCertified",
  "thng": "UKn4wYKEYyQnc2aawGhytBfc",
  "createdAt": 1537872362453,
  "customFields": {
    "actionId": "U5mQKGDpnymBwQwRakyBqeYh",
    "dataSetId": "0xe4a05894ae8132a5c083c0bc05d4dd164abeea123dd264646f777c443f5e3e43",
    "ethereumWallet": "0xE1E9c5379C5...",
    "importRes": {
      "data_set_id": "0xe4a05894ae8132a5c083c0bc05d4dd164abeea123dd264646f777c443f5e3e43",
      "message": "Import success",
      "wallet": "0xE1E9c5379C5df627a8De3a951fA493028394A050"
    },
    "originTrailUrl": "https://evrythng.origintrail.io/?value=urn:epc:id:sgtin:UqdMHQppngd7eXwRwmXKBhQr",
    "replicationId": "3c2d115d-8140-46ce-80e1-14031f2440c6",
    "replicationRes": {
      "data_set_id": "0xe4a05894ae8132a5c083c0bc05d4dd164abeea123dd264646f777c443f5e3e43",
      "replication_id": "3c2d115d-8140-46ce-80e1-14031f2440c6"
    }
  },
  "timestamp": 1537872362453,
  "location": {
    "latitude": 39.0481,
    "longitude": -77.4728,
    "position": {
      "type": "Point",
      "coordinates": [
        -77.4728,
        39.0481
      ]
    }
  },
  "locationSource": "geoIp",
  "createdByProject": "UnnGRADHBgswtKRwRE5HPpTk",
  "createdByApp": "U5H4wYb5y2xRhNwwa3cH9Nsa"
}
```
