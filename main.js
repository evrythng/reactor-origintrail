const request = require('request');

// URL (and port if applicable) of the OriginTrail node
const OT_NODE_URL = '';
// Auth token for that node
const OT_AUTH_TOKEN = '';
// Company's name
const COMPANY_NAME = '';
// Company's contact email address
const COMPANY_EMAIL = '';
// Company's blockchain wallet
const COMPANY_WALLET = '';
// Product's batch SGTIN
const SGTIN = '';
// Action type to use for the resulting action
const RESULT_ACTION_TYPE = '_originTrailCertified';

/**
 * Build the XML payload from the EVRYTHNG action and Thng.
 * @param {Object} action - The action that occurred.
 * @param {Object} thng - The Thng the action occurred on.
 * @returns {String} - An XML document string that contains event data.
 */
const buildXmlDocument = (action, thng) => {
  const { location, createdAt, context } = action;
  const { latitude, longitude } = location;
  const creationTime = new Date(createdAt).toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
  <epcis:EPCISDocument xmlns:epcis="urn:epcglobal:epcis:xsd:1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:sbdh="http://www.unece.org/cefact/namespaces/StandardBusinessDocumentHeader" schemaVersion="0" creationDate="2001-12-17T09:30:47Z" xsi:schemaLocation="urn:epcglobal:epcis:xsd:1  http://www.gs1si.org/BMS/epcis/1_2/EPCglobal-epcis-1_2.xsd">
    <EPCISHeader>
      <sbdh:StandardBusinessDocumentHeader>
        <sbdh:HeaderVersion>1.0</sbdh:HeaderVersion>
        <sbdh:Sender>
          <sbdh:Identifier Authority="OriginTrail">urn:ot:object:actor:id:${COMPANY_NAME}</sbdh:Identifier>
          <sbdh:ContactInformation>
            <sbdh:Contact>${COMPANY_NAME}</sbdh:Contact>
            <sbdh:EmailAddress>${COMPANY_EMAIL}</sbdh:EmailAddress>
          </sbdh:ContactInformation>
        </sbdh:Sender>
        <sbdh:Receiver>
          <sbdh:Identifier Authority="OriginTrail">urn:ot:object:actor:id:${COMPANY_NAME}</sbdh:Identifier>
          <sbdh:ContactInformation>
            <sbdh:Contact>${COMPANY_NAME}</sbdh:Contact>
            <sbdh:EmailAddress>${COMPANY_EMAIL}</sbdh:EmailAddress>
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
                <VocabularyElement id="urn:ot:object:actor:id:${COMPANY_NAME}">
                  <attribute id="urn:ot:object:actor:name">${COMPANY_NAME}</attribute>
                  <attribute id="urn:ot:object:actor:category">Company</attribute>
                  <attribute id="urn:ot:object:actor:wallet">${COMPANY_WALLET}</attribute>
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
                <VocabularyElement id="urn:epc:id:sgtin:${SGTIN}">
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
            <epc>urn:epc:id:sgtin:${SGTIN}</epc>
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
                <epcClass>urn:epc:id:sgtin:${SGTIN}</epcClass>
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
 * Read a complete Thng object from its ID.
 * @param {String} id - ID of the Thng to read.
 * @returns {Promise} A Promise that resolves to the Thng object.
 */
const readThng = id => app.thng(id).read();

/**
 * Create an OriginTrail action through their API.
 * @param {Object} action - The action that occurred.
 * @param {Object} thng - The Thng the action occurred on.
 * @returns {Promise} A Promise that resolves to the resulting action.
 */
const createOriginTrailAction = (action, thng) => new Promise((resolve, reject) => {
  // Send data to OriginTrail
  const url = `${OT_NODE_URL}/api/import?auth_token=${OT_AUTH_TOKEN}`;
  const formData = { importfile: buildXmlDocument(action, thng), importtype: 'GS1' };
  request.post({ url, formData }, (err, res, body) => {
    if (err) {
      reject(err);
      return;
    }

    logger.info(`Event exported to OriginTrail -- ${body}`);

    // Create resulting EVRYTHNG action
    const otData = JSON.parse(body);
    const payload = {
      thng: action.thng,
      customFields: {
        actionId: action.id,
        originTrailUrl: `https://evrythng.origintrail.io/?value=urn:epc:id:sgtin:${SGTIN}`,
        originTrailImport: otData.import_id,
        ethereumWallet: COMPANY_WALLET,
      },
    };
    app.action(RESULT_ACTION_TYPE).create(payload)
      .then(resolve)
      .catch(reject);
  });
});

// @filter(onActionCreated) action.customFields.createOriginTrail=true
function onActionCreated(event) {
  const { action } = event;
  logger.info(`Received action to be certified via OriginTrail: ${action.id}`);

  readThng(action.thng)
    .then(thng => createOriginTrailAction(action, thng))
    .then(newAction => logger.info(`Created OriginTrail action: ${newAction.id}`))
    .catch(err => logger.error(err.message || JSON.stringify(err)))
    .then(done);
}
