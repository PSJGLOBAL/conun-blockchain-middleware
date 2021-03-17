const { Gateway, Wallets, Transaction } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const helper = require('./helper')

const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');

async function connectionOrg(walletAddress, org_name) {
    try {
        console.log('connectionOrg: ', walletAddress, org_name);
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org1.json');
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
        const ccp = JSON.parse(ccpJSON);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(walletAddress);
        if (!identity) return;

        const connectOptions = {
            wallet, identity: walletAddress, discovery: { enabled: true, asLocalhost: true }
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
    BalanceOf: async (arg) => {
        try {
            console.log('arg: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);

            // Get the contract from the network.
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.evaluateTransaction(arg.fcn, arg.walletAddress);
            console.log(`Transaction has been evaluated, result is: ${result}`);
            return result.toString();
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            return false
        }
    },

    GetDetails: async (arg) => {
        try {
            console.log('arg: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);
            let result = await contract.evaluateTransaction(arg.fcn);
            console.log(`Transaction has been evaluated, result is: ${result}`);
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            return false
        }
    },

    ClientAccountID: async (arg) => {
        try {
            console.log('arg: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);
            let result = await contract.evaluateTransaction(arg.fcn);
            console.log(`Transaction has been evaluated, result is: ${result}`);
            return result.toString();
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            return false
        }
    },

    _getTransactionByID: async (arg) => {
        try {
            console.log('arg: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            // const channel = connection.getChannel(arg.channelName);

            // Get the contract from the network.
            // const contract = network.getContract(arg.chainCodeName);

            // let result = await contract.evaluateTransaction(arg.fcn, arg.wallet_address);
            //todo ' peer chaincode invoke \
            //         -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
            //         $PEER_CONN_PARMS \
            //         -C mychannel -n qscc \
            //         -c '{"function":"GetTransactionByID","Args":["mychannel", "b2d4920bb653cced5622e7a51dc90f3c23df83172eaee670605e4be1d1b1f6e5"]}'
            let result = await network.queryTransaction('b2d4920bb653cced5622e7a51dc90f3c23df83172eaee670605e4be1d1b1f6e5', 'peer0.org1.example.com')

            console.log(`Transaction has been evaluated, result is: ${result}`);
            return JSON.parse(result.toString());
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            return false
        }
    }
}
