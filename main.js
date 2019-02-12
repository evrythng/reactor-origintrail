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

/**
 * Build the XML payload from the EVRYTHNG action and Thng.
 * @param {Object} action - The action that occurred.
 * @param {Object} thng - The Thng the action occurred on.
 * @returns {String} - An XML document string that contains event data.
 */
const buildXmlDocument = (action, thng) => {
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
                <VocabularyElement id="urn:ot:object:product:${thng.id}">
                  <attribute id="urn:ot:object:product:category">Product</attribute>
                  <attribute id="urn:ot:object:product:description">${thng.name}</attribute>
                </VocabularyElement>
              </VocabularyElementList>
            </Vocabulary>
            <Vocabulary type="urn:ot:object:batch">
              <VocabularyElementList>
                <VocabularyElement id="urn:epc:id:sgtin:${thng.id}">
                  <attribute id="urn:ot:object:product:batch:productId">urn:ot:object:product:${thng.id}</attribute>
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
            <epc>urn:epc:id:sgtin:${thng.id}</epc>
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
                <epcClass>urn:epc:id:sgtin:${thng.id}</epcClass>
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
 * Read the complete Thng object from the action.
 * @param {Object} action - The action that triggered the script.
 * @returns {Promise} A Promise that resolves to the Thng object, or an error.
 */
const readThng = (action) => {
  if (!action.thng) {
    return Promise.reject('Action did not specify a Thng');
  }

  return app.thng(action.thng).read();
};

/**
 * Create an OriginTrail import through their API.
 * @param {Object} action - The action that occurred.
 * @param {Object} thng - The Thng the action occurred on.
 * @returns {Promise} A Promise that resolves to the response body.
 */
const createImport = (action, thng) => new Promise((resolve, reject) => {
  // Send data to OriginTrail
  const url = `${OT_NODE_URL}/api/import?auth_token=${OT_AUTH_TOKEN}`;
  const formData = { importfile: buildXmlDocument(action, thng), importtype: 'GS1' };
  request.post({ url, formData }, (err, res, body) => {
    if (err) {
      reject(err);
      return;
    }

    logger.info(`Event exported to OriginTrail -- ${body}`);
    resolve(body);
  });
});

/**
 * Create the confirmation action using the OriginTrail response.
 *
 * @param {object} action - The triggering action.
 * @param {object} thng - The Thng.
 * @param {string} body - The response from the OriginTrail API.
 * @returns {Promise} Promise that resolves to the new confirmation action.
 */
const createConfirmationAction = (action, thng, body) => {
  const fullResponse = JSON.parse(body);
  const payload = {
    thng: action.thng,
    customFields: {
      actionId: action.id,
      originTrailUrl: `https://evrythng.origintrail.io/?value=urn:epc:id:sgtin:${thng.id}`,
      dataSetId: fullResponse.data_set_id,
      ethereumWallet: WALLET,
      fullResponse,
    },
  };
  return app.action(OUTPUT_ACTION_TYPE).create(payload);
};

// @filter(onActionCreated) action.customFields.createOriginTrail=true
function onActionCreated(event) {
  const { action } = event;
  logger.info(`Received action to be certified via OriginTrail: ${action.id}`);

  readThng(action)
    .then((thng) => {
      return createImport(action, thng)
        .then(body => createConfirmationAction(action, thng, body));
    })
    .then(newAction => logger.info(`Created OriginTrail action: ${newAction.id}`))
    .catch(err => logger.error(err.message || JSON.stringify(err)))
    .then(done);
}

module.exports = { onActionCreated };
