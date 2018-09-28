# reactor-origintrail

A Reactor script to verify EVRYTHNG Actions on the blockchain via OriginTrail.


## Configure

* Get credentials for the OriginTrail node and an SGTIN, and add them to 
  `main.js`.
* Create the  `OUTPUT_ACTION_TYPE` (the default, or your choice) action type in 
  the EVRYTHNG project.
* Deploy this Reactor script in an application within that project, not 
  forgetting to specify the `dependencies` in `package.json`.

Some example configuration values (truncated):

```js
// Auth token for the node
const OT_AUTH_TOKEN = 'cd64dd41...';
// Item's SGTIN
const SGTIN = 'Up4nR6KUGYaVtXawwkYBmpcf';
// Action type to use for the resulting output action
const OUTPUT_ACTION_TYPE = '_originTrailCertified';
// The sending company's name
const COMPANY_NAME = 'EVRYTHNG';
// The sending company's contact email
const COMPANY_EMAIL = 'otnode@evrythng.com';
```


## Use

The script will react to actions with a `createOriginTrail=true` custom field 
and will create a blockchain transaction for the action using the specified
OriginTrail node. For convenience, EVRYTHNG offers managed OriginTrail nodes
that you can use, such as `https://origintrail.evrythng.io`.

The result will include the transaction ID from the blockchain 
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
