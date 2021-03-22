const { Gateway } = require('fabric-network');
const helper = require('./helper/drive.helper');


module.exports = {
    CreateFile: async (arg) => {
        try {
            console.log('>> Transfer: ', arg);
            if (arg._from === arg.to) return false
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
    }
}
