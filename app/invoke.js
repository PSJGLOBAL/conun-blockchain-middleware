const { Gateway } = require('fabric-network');
const connectionOrg = require('./helper/conection');
const config = require('config');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(config.get('ethereum.httpProvider'));
const web3 = new Web3(provider);

module.exports = {
    Transfer: async (arg) => {
        try {
            console.log('>> Transfer: ', arg);
            console.log('Wei: ', web3.utils.toWei(arg.value));
            if(arg.walletAddress === arg.to) return false;
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);
            let _value = web3.utils.toWei(arg.value, 'ether');
            let result = await contract.submitTransaction(arg.fcn, arg.walletAddress, arg.to, _value);
            await gateway.disconnect();

            let payload = JSON.parse(result.toString());
            payload.Func.Amount = web3.utils.fromWei(payload.Func.Amount, "ether");
            return payload;
        } catch (error) {
            console.log(`Getting error: ${error}`);
            return false
        }
    },

    Burn: async (arg) => {
        try {
            console.log('>> Burn: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let _amount = web3.utils.toWei(arg.amount, 'ether');
            let result = await contract.submitTransaction(arg.fcn, _amount);
            await gateway.disconnect();


            let payload = JSON.parse(result.toString());
            payload.Func.Amount = web3.utils.fromWei(payload.Func.Amount, "ether");
            payload.Func.Total = web3.utils.fromWei(payload.Func.Total, "ether");
            return payload;

        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    },

    Mint: async (arg) => {
        try {
            console.log('>> Mint: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let _amount = web3.utils.toWei(arg.amount, 'ether');
            let result = await contract.submitTransaction(arg.fcn, _amount);

            await gateway.disconnect();

            let payload = JSON.parse(result.toString());
            payload.Func.Amount = web3.utils.fromWei(payload.Func.Amount, "ether");
            payload.Func.Total = web3.utils.fromWei(payload.Func.Total, "ether");
            return payload;

        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    },

    Init: async (arg) => {
        try {
            console.log('>> Init: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
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
};


