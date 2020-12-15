const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const helper = require('./helper')


async function connectionOrg(wallet_address, org_name) {
    try {
        console.log('connectionOrg: ', wallet_address, org_name);
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
            console.log('Run the registerUser.js application before retrying', identity);
            return;
        }

        const connectOptions = {
            wallet, identity: wallet_address, discovery: { enabled: true, asLocalhost: true }
        }

        return {
            ccp,
            connectOptions
        }
    } catch (e) {
        console.log('connectionOrg Error: ', e);
    }
}

module.exports = {
    query: async (arg) => {
        try {
            console.log('arg: ', arg);
            const connection = await connectionOrg(arg.wallet_address, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);

            // Get the contract from the network.
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.evaluateTransaction(arg.fcn, arg.wallet_address);
            console.log(`Transaction has been evaluated, result is: ${result}`);
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            return error.message
        }
    }
}