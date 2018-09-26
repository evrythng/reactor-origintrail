# reactor-origintrail

A Reactor script to verify EVRYTHNG Actions on the blockchain via OriginTrail.


## Configure

* Get credentials for your OriginTrail node, as well as company details, and add 
  them to `main.js`.
* Create a `_originTrailCertified` action type in the EVRYTHNG project.
* Deploy this Reactor script in an application within that project, not 
  forgetting to specify the `dependencies` in `package.json`.

Some example configuration values (truncated):

```js
// URL (and port if applicable) of the OriginTrail node
const OT_NODE_URL = 'https://evrythng.origintrail.io:8900';
// Auth token for that node
const OT_AUTH_TOKEN = 'cd64dd41...';
// Company's name
const COMPANY_NAME = 'EVRYTHNG';
// Company's contact email address
const COMPANY_EMAIL = 'otnode@evrthng.com';
// Company's blockchain wallet
const COMPANY_WALLET = '0xE1E9c537...';
// Product's batch SGTIN
const SGTIN = 'Up4nR6KUGYaVtXawwkYBmpcf';
// Action type to use for the resulting action
const RESULT_ACTION_TYPE = '_originTrailCertified';
```


## Use

The script will react to actions with a `createOriginTrail=true` custom field 
and will create a blockchain transaction for the action using the specified
OriginTrail node. The result will include the transaction ID from the blockchain 
and will be added to a new confirmation action (as specified by 
`RESULT_ACTION_TYPE`).


## Testing

Once the script is installed, test it by creating an action with the correct
custom field specified on a Thng in the project's scope, for example:

```json
{
  "thng": "UKn4wYKEYyQnc2aawGhytBfc",
  "type": "_ItemShipped",
  "customFields": {
    "createOriginTrail": true
  }
}
```

The resulting action created by the script will contain important information 
from the OriginTrail API:

```json
{
  "id": "U5nHbb84reSPeGaRampWfpTk",
  "createdAt": 1537872362453,
  "customFields": {
    "actionId": "U5mQKGDpnymBwQwRakyBqeYh",
    "ethereumWallet": "0xE1E9c537...",
    "originTrailImport": "0xd44182d1...",
    "originTrailUrl": "https://evrythng.origintrail.io/?value=urn:epc:id:sgtin:Up4nR6KUGYaVtXawwkYBmpcf"
  },
  "timestamp": 1537872362453,
  "type": "_originTrailCertified",
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
  "createdByApp": "U5H4wYb5y2xRhNwwa3cH9Nsa",
  "thng": "UKn4wYKEYyQnc2aawGhytBfc"
}
```
