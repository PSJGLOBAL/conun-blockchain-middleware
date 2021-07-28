const { Gateway } = require('fabric-network');
const connectionOrg = require('./helper/conection');
const config = require('config');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(config.get('ethereum.httpProvider'));
const web3 = new Web3(provider);

const Helper = require('../common/helper');
const logger = Helper.getLogger('app');

function splitString(msg) {
    try {
        const [name, error] = msg.split('\n');
        const [peer, status, message] = error.split(', ');
        return name + message
    } catch (e) {
        console.log('splitString err: ', e);
        return msg
    }
}

module.exports = {
    Transfer: async (arg) => {
        try {
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
            return {
                status: true,
                message: payload
            }
        } catch (error) {
            logger.error(`Transfer error: ${error.message}, arg: ${arg}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    },

    Burn: async (arg) => {
        try {
            logger.info('>> Burn: ', arg);
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
            return {
                status: true,
                message: payload
            };

        } catch (error) {
            logger.error(`Burn error: ${error.message}, arg: ${arg}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    },

    Mint: async (arg) => {
        try {
            logger.info('>> Mint: ', arg);
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
            return {
                status: true,
                message: payload
            };

        } catch (error) {
            logger.error(`Mint error: ${error.message}, arg: ${arg}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    },

    Init: async (arg) => {
        try {
            logger.info('>> Init: ', arg);
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let result = await contract.submitTransaction(arg.fcn, arg.walletAddress);
            await gateway.disconnect();

            logger.info('>> Init result: ', JSON.parse(result.toString()));

            return {
                status: true,
                message: JSON.parse(result.toString())
            }
        } catch (error) {
            logger.error(`Init error: ${error.message}, arg: ${arg}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }
};


