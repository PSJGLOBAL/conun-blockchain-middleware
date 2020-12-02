const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
// const logger = log4js.getLogger('BasicNetwork');
const util = require('util')


const helper = require('./helper')
const query = async (channelName, chaincodeName, fcn, wallet_address, org_name) => {

    try {

        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org1.json');
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
        const ccp = JSON.parse(ccpJSON);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(wallet_address);
        if (!identity) {
            console.log(`An identity for the user ${wallet_address} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(wallet_address, org_name, true)
            identity = await wallet.get(wallet_address);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet, identity: wallet_address, discovery: { enabled: true, asLocalhost: true }
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);
        console.log(fcn)
        let result = await contract.evaluateTransaction(fcn);
        console.log(`Transaction has been evaluated, result is: ${result}`);
        //result = JSON.parse(result.toString());
        return result
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return error.message

    }
}

exports.query = query