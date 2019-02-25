const request = require('request');

// Auth token for the node
const OT_AUTH_TOKEN = '';

// Fixed configuration values
const OT_NODE_URL = 'https://origintrail.evrythng.io';
const WALLET = '0xE1E9c5379C5df627a8De3a951fA493028394A050';
const DEFAULT_SENDER_NAME = 'EVRYTHNG';
const DEFAULT_SENDER_EMAIL = 'otnode@evrythng.com';
const DEFAULT_RECEIVER_NAME = 'EVRYTHNG';
const DEFAULT_RECEIVER_EMAIL = 'otnode@evrythng.com';
const OUTPUT_ACTION_TYPE = '_originTrailCertified';

let action, target, targetType, replicationRequested, importRes, replicationRes;

/**
 * Build the XML payload from the EVRYTHNG action and target resource.
 *
 * @returns {String} - An XML document string that contains event data.
 */
const buildXmlDocument = () => {
  const { location, createdAt, context, customFields } = action;
  const { latitude, longitude } = location;
  const creationTime = new Date(createdAt).toISOString();
  const senderName = customFields.senderName || DEFAULT_SENDER_NAME;
  const senderEmail = customFields.senderEmail || DEFAULT_SENDER_EMAIL;
  const receiverName = customFields.receiverName || DEFAULT_RECEIVER_NAME;
  const receiverEmail = customFields.receiverEmail || DEFAULT_RECEIVER_EMAIL;

  return `<?xml version="1.0" encoding="UTF-8"?>
  <epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:sbdh="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" schemaVersion="0" creationDate="2001-12-17T09:30:47Z" xsi:schemaLocation="urn:epcglobal:epcis:xsd:1  http://www.gs1si.org/BMS/epcis/1_2/EPCglobal-epcis-1_2.xsd">
    <EPCISHeader>
      <sbdh:StandardBusinessDocumentHeader>
        <sbdh:HeaderVersion>1.0</sbdh:HeaderVersion>
        <sbdh:Sender>
          <sbdh:Identifier Authority="OriginTrail">urn:ot:object:actor:id:${senderName}</sbdh:Identifier>
          <sbdh:ContactInformation>
            <sbdh:Contact>${senderName}</sbdh:Contact>
            <sbdh:EmailAddress>${senderEmail}</sbdh:EmailAddress>
          </sbdh:ContactInformation>
        </sbdh:Sender>
        <sbdh:Receiver>
          <sbdh:Identifier Authority="OriginTrail">urn:ot:object:actor:id:${receiverName}</sbdh:Identifier>
          <sbdh:ContactInformation>
            <sbdh:Contact>${receiverName}</sbdh:Contact>
            <sbdh:EmailAddress>${receiverEmail}</sbdh:EmailAddress>
          </sbdh:ContactInformation>
        </sbdh:Receiver>
        <sbdh:DocumentIdentification>
          <sbdh:Standard>GS1</sbdh:Standard>
          <sbdh:TypeVersion>V1.3</sbdh:TypeVersion>
          <sbdh:InstanceIdentifier>100001</sbdh:InstanceIdentifier>
          <sbdh:Type>Scan</sbdh:Type>
          <sbdh:CreationDateAndTime>${creationTime}</sbdh:CreationDateAndTime>
        </sbdh:DocumentIdentification>
        <sbdh:BusinessScope>
          <sbdh:Scope>
            <sbdh:Type>BusinessProcess</sbdh:Type>
            <sbdh:InstanceIdentifier>Shipment/version2-251</sbdh:InstanceIdentifier>
            <sbdh:Identifier>EDI-Shipment</sbdh:Identifier>
          </sbdh:Scope>
        </sbdh:BusinessScope>
      </sbdh:StandardBusinessDocumentHeader>
      <extension>
        <EPCISMasterData>
          <VocabularyList>
            <Vocabulary type="urn:ot:object:actor">
              <VocabularyElementList>
                <VocabularyElement id="urn:ot:object:actor:id:${senderName}">
                  <attribute id="urn:ot:object:actor:name">${senderName}</attribute>
                  <attribute id="urn:ot:object:actor:category">Company</attribute>
                  <attribute id="urn:ot:object:actor:wallet">${WALLET}</attribute>
                </VocabularyElement>
              </VocabularyElementList>
            </Vocabulary>
            <Vocabulary type="urn:ot:object:location">
              <VocabularyElementList>
                <VocabularyElement id="urn:ot:object:location:id:geoIp:${latitude}:${longitude}">
                  <attribute id="urn:ot:object:location:latitude">${latitude}</attribute>
                  <attribute id="urn:ot:object:location:longitude">${longitude}</attribute>
                  <attribute id="urn:ot:object:location:category">Point</attribute>
                  <attribute id="urn:ot:object:location:description">Scan point</attribute>
                  <attribute id="urn:ot:object:location:ipAddress">${context.ipAddress}</attribute>
                  <attribute id="urn:ot:object:location:city">${context.city}</attribute>
                  <attribute id="urn:ot:object:location:region">${context.region}</attribute>
                  <attribute id="urn:ot:object:location:countryCode">${context.countryCode}</attribute>
                </VocabularyElement>
              </VocabularyElementList>
            </Vocabulary>
            <Vocabulary type="urn:ot:object:product">
              <VocabularyElementList>
                <VocabularyElement id="urn:ot:object:product:${target.id}">
                  <attribute id="urn:ot:object:product:category">Product</attribute>
                  <attribute id="urn:ot:object:product:description">${target.name}</attribute>
                </VocabularyElement>
              </VocabularyElementList>
            </Vocabulary>
            <Vocabulary type="urn:ot:object:batch">
              <VocabularyElementList>
                <VocabularyElement id="urn:epc:id:sgtin:${target.id}">
                  <attribute id="urn:ot:object:product:batch:productId">urn:ot:object:product:${target.id}</attribute>
                </VocabularyElement>
              </VocabularyElementList>
            </Vocabulary>
          </VocabularyList>
        </EPCISMasterData>
      </extension>
    </EPCISHeader>
    <EPCISBody>
      <EventList>
        <ObjectEvent>
          <eventTime>${creationTime}</eventTime>
          <eventTimeZoneOffset>-00:00</eventTimeZoneOffset>
          <epcList>
            <epc>urn:epc:id:sgtin:${target.id}</epc>
          </epcList>
          <action>OBSERVE</action>
          <bizStep>urn:epcglobal:cbv:bizstep:observation</bizStep>
          <disposition>urn:epcglobal:cbv:disp:active</disposition>
          <readPoint>
            <id>urn:ot:object:location:id:geoIp:${latitude}:${longitude}</id>
          </readPoint>
          <bizLocation>
            <id>urn:ot:object:location:id:geoIp:${latitude}:${longitude}</id>
          </bizLocation>
          <extension>
            <quantityList>
              <quantityElement>
                <epcClass>urn:epc:id:sgtin:${target.id}</epcClass>
                <quantity>1</quantity>
                <uom>PCS</uom>
              </quantityElement>
            </quantityList>
            <extension>
              <documentId>${creationTime}</documentId>
              <OTEventClass>urn:ot:event:Observation</OTEventClass>
              <OTEventType>Observation</OTEventType>
            </extension>
          </extension>
        </ObjectEvent>
      </EventList>
    </EPCISBody>
  </epcis:EPCISDocument>`;
};

/**
 * Read the complete target object from the action.
 * This is either a Thng, product, or collection. Only 'id' and 'name' is required
 * by buildXmlDocument(), so this works nicely.
 *
 * @returns {Promise} A Promise that resolves once the process is complete.
 */
const readTarget = () => {
  if (action.thng) {
    return app.thng(action.thng).read().then((res) => {
      target = res;
    });
  }

  if (action.collection) {
    return app.collection(action.collection).read().then((res) => {
      target = res;
    });
  }

  if (action.product) {
    return app.product(action.product).read().then((res) => {
      target = res;
    });
  }

  return Promise.reject('Action did not specify a target');
};

/**
 * Promise and error handling wrapper for request()
 *
 * @param {object} opts - Request options.
 * @returns {Promise} Promise resolving to the request response object.
 */
const requestPromise = opts => new Promise((resolve, reject) => {
  request(opts, (err, response, body) => {
    if (err) {
      reject(err);
      return;
    }
    if (response.statusCode > 400) {
      reject(body);
      return;
    }

    resolve(JSON.parse(body));
  });
});

/**
 * Create an OriginTrail import through their API.
 *
 * @returns {Promise} A Promise that resolves when the request is complete.
 */
const createImport = () => requestPromise({
  url: `${OT_NODE_URL}/api/import?auth_token=${OT_AUTH_TOKEN}`,
  method: 'post',
  formData: { importfile: buildXmlDocument(), importtype: 'GS1' },
}).then((json) => {
  logger.info(`Event exported to OriginTrail -- ${JSON.stringify(json)}`);
  importRes = json;
});

/**
 * Use the import response to request replication, if required by the user with
 * the replicateOriginTrail=true customField.
 *
 * @returns {Promise} Promise that resolves when the request is complete.
 */
const requestReplication = () => {
  if (!replicationRequested) {
    logger.info('Replication was not requested, skipping');
    return Promise.resolve();
  }

  return requestPromise({
    url: `${OT_NODE_URL}/api/replication?auth_token=${OT_AUTH_TOKEN}`,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data_set_id: importRes.data_set_id }),
  }).then((json) => {
    replicationRes = json;
    logger.info(`Replication response: ${JSON.stringify(json)}`);
  });
};

/**
 * Create the confirmation action using the OriginTrail response.
 *
 * @returns {Promise} Promise that resolves to the new confirmation action.
 */
const createConfirmationAction = () => {
  const payload = {
    customFields: {
      actionId: action.id,
      ethereumWallet: WALLET,
      originTrailUrl: `https://evrythng.origintrail.io/?value=urn:epc:id:sgtin:${target.id}`,
      dataSetId: importRes.data_set_id,
      replicationId: replicationRes.replication_id,
      importRes,
      replicationRes,
    },
  };

  if (action.thng) {
    payload.thng = action.thng;
  } else if (action.product) {
    payload.product = action.product;
  } else if (action.collection) {
    payload.collection = action.collection;
  }

  return app.action(OUTPUT_ACTION_TYPE).create(payload);
};

// @filter(onActionCreated) action.customFields.createOriginTrail=true
function onActionCreated(event) {
  action = event.action;
  replicationRequested = action.customFields.replicateOriginTrail;
  logger.info(`Received action to be certified via OriginTrail: ${action.id}`);

  readTarget()
    .then(createImport)
    .then(requestReplication)
    .then(createConfirmationAction)
    .then(newAction => logger.info(`Created OriginTrail action: ${newAction.id}`))
    .catch(err => logger.error(err.message || JSON.stringify(err)))
    .then(done);
}

module.exports = { onActionCreated };
