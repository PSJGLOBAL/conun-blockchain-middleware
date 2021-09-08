const fs = require('fs');
const path = require("path")
const { Wallets, DefaultEventHandlerStrategies  } = require('fabric-network');

const ccpPath = path.resolve(__dirname, '../../', 'config', 'connection-org1.json');
const appConfig = require("config")
const Helper = require("../../common/helper")
const DiscoveryOption =  appConfig.get('discoveryOption');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const logger = Helper.getLogger("ConnectionOrg");

async function connectionOrg(walletAddress, orgName) {
    try {
        logger.info('connectionOrg: ', walletAddress, orgName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        logger.info(`connectionOrg Wallet path: ${walletPath}`);

        // // Check to see if we've already enrolled the user.
        let identity = await wallet.get(walletAddress);
        if (!identity) return;

        const connectOptions = {
            wallet, identity: walletAddress, discovery: { enabled: true, asLocalhost: DiscoveryOption },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
            },
        };

        const queryConnectOptions = {
            wallet, identity: walletAddress, discovery: { enabled: true, asLocalhost: DiscoveryOption }
        };

        return {
            ccp,
            connectOptions,
            queryConnectOptions
        };

    } catch (e) {
        logger.error('connectionOrg Error: ', e);
    }
}

module.exports = connectionOrg;
