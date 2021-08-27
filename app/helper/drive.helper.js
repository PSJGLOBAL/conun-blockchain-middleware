const { Gateway, Wallets, DefaultEventHandlerStrategies  } = require('fabric-network');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const crypto = require('../../utils/crypto/encryption.algorithm');
const ccpPath = path.resolve(__dirname, '../../', 'config', 'connection-org1.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const mapOrganizations = new Map();
mapOrganizations.set('Org1', 'ca.org1.conun.io');
mapOrganizations.set('Org2', 'ca.org2.conun.io');
