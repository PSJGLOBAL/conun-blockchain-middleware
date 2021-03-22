const { Gateway } = require('fabric-network');
const helper = require('./helper/token.helper');


module.exports = {
    Transfer: async (arg) => {
        try {
            console.log('>> Transfer: ', arg);
            if(arg._from === arg.to) return false
            const connection = await helper.connectionOrg(arg._from, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);
            // let status = await checkWalletAddress(arg.to, arg.orgName);
            // if(!status) return false;

            let result = await contract.submitTransaction(arg.fcn, arg._from, arg.to, arg.value);
            await gateway.disconnect();
            return JSON.parse(result.toString());
        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    },

    Burn: async (arg) => {
        try {
            console.log('>> Burn: ', arg);
            const connection = await helper.connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.submitTransaction(arg.fcn, arg.amount);

            await gateway.disconnect();

            return JSON.parse(result.toString());

        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    },

    Mint: async (arg) => {
        try {
            console.log('>> Mint: ', arg);
            const connection = await helper.connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.submitTransaction(arg.fcn, arg.amount);

            await gateway.disconnect();

            return JSON.parse(result.toString());

        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    },

    Init: async (arg) => {
        try {
            console.log('>> Init: ', arg);
            const connection = await helper.connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.submitTransaction(arg.fcn, arg.walletAddress);
            await gateway.disconnect();

            return JSON.parse(result.toString());
        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    }

}


