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
            console.log('Transfer>> :', arg);
            if(arg.walletAddress === arg.to) return false;
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            console.log('transfer -> connection: ', connection.connectOptions.identity);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);
            let _value = web3.utils.toWei(arg.value, 'ether');
            
            //  submitTransaction(func, wallet-address)
            let result = await contract.submitTransaction(arg.fcn, connection.connectOptions.identity, arg.to, _value, arg.messageHash, arg.signature);
            console.log('result>> :', result);
            await gateway.disconnect();

            let payload = JSON.parse(result.toString());
            console.log('transfer -> payload: ', payload);
            payload.Func.Value = web3.utils.fromWei(payload.Func.Value, "ether");
            return {
                status: true,
                message: payload
            }
        } catch (error) {
            console.log('Transfer-error: ', error)
            logger.error(`Transfer error: ${error.message}, arg: ${arg}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    },

    BurnFrom: async (arg) => {
        try {
            logger.info('>> BurnFrom: ', arg);
            let result, payload = null;
            const connection = await connectionOrg(arg.walletAddress, arg.orgName);
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(connection.ccp, connection.connectOptions);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork(arg.channelName);
            const contract = network.getContract(arg.chainCodeName);

            let value = web3.utils.toWei(arg.amount, 'ether');


            if(arg.chainCodeName === 'CONX') {
                const transaction = contract.createTransaction(arg.fcn);
                result = await transaction.submit(arg.walletAddress, value, arg.messageHash, arg.signature);
                payload = JSON.parse(result.toString());
                console.log('payload CONX send: ', payload)
                payload.Func.Value = web3.utils.fromWei(payload.Func.Value, "ether");
                gateway.disconnect();
                return {
                    status: true,
                    message: payload
                };
            }
            else if(arg.chainCodeName === 'bridge') {
                console.log('2-BurnFrom >> ');
                const transaction = contract.createTransaction(arg.fcn);
                result = 
                await transaction.submit(JSON.stringify(
                    {
                    Id: arg.id,
                    User: arg.walletAddress,
                    Value: value,
                    Message: arg.messageHash,
                    Signature: arg.signature
                    }
             ));
             payload = JSON.parse(result.toString());
             payload.Value = web3.utils.fromWei(payload.Value, "ether");
             payload.txHash = transaction.getTransactionId();
             gateway.disconnect(); 
             return {
                 status: true,
                 message: payload
             };
            }

        } catch (error) {
            console.log(`BurnFrom Swap error: ${error.message}, arg: ${arg}`)
            logger.error(`BurnFrom error: ${error.message}, arg: ${arg}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    },

    MintAndTransfer: async(arg) => {
        const connection = await connectionOrg(arg.walletAddress, arg.orgName);
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(connection.ccp, connection.connectOptions);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(arg.channelName);
        const contract = network.getContract(arg.chainCodeName);
     
        let value = web3.utils.toWei(arg.amount, 'ether');
        
        return new Promise(
            (resolve, reject) => {

                if(arg.chainCodeName === 'CONX') {
                    const transaction = contract.createTransaction(arg.fcn);
                    console.log('CONX >> ')
                    let result = await transaction.submit(arg.walletAddress, value, arg.messageHash, arg.signature);
                    let payload = JSON.parse(result.toString());
                    payload.Func.Value = web3.utils.fromWei(payload.Func.Value, "ether");
                    gateway.disconnect();  
                    resolve({
                        status: true,
                        message: payload
                    });
                }
                else if(arg.chainCodeName === 'bridge') {
                    console.log('2-MintAndTransfer >> ')
                    const transaction = contract.createTransaction(arg.fcn);
                    transaction.submit(JSON.stringify(
                        {
                            Id: arg.id,
                            Key: arg.key,
                            User: arg.walletAddress,
                            value: value,
                            Message: arg.messageHash,
                            Signature: arg.signature
                        }
                    ))
                    .then((result) => {
                        console.log('result >>', result.toString());
                        let payload = JSON.parse(result.toString());
                        payload.Value = web3.utils.fromWei(payload.Value, "ether");
                        payload.txHash = transaction.getTransactionId();
                        gateway.disconnect();
                        resolve({
                            status: true,
                            message: payload
                        });
                    })
                    .catch((error) => {
                        reject(error);
                    })
                }
            });



        // try {
        //     let result, payload = null;
        //     const connection = await connectionOrg(arg.walletAddress, arg.orgName);
        //     // Create a new gateway for connecting to our peer node.
        //     const gateway = new Gateway();
        //     await gateway.connect(connection.ccp, connection.connectOptions);

        //     // Get the network (channel) our contract is deployed to.
        //     const network = await gateway.getNetwork(arg.channelName);
        //     const contract = network.getContract(arg.chainCodeName);
         
        //     let value = web3.utils.toWei(arg.amount, 'ether');
            
        //     if(arg.chainCodeName === 'CONX') {
        //         const transaction = contract.createTransaction(arg.fcn);
        //         console.log('CONX >> ')
        //         result = await transaction.submit(arg.walletAddress, value, arg.messageHash, arg.signature);
        //         payload = JSON.parse(result.toString());
        //         payload.Func.Value = web3.utils.fromWei(payload.Func.Value, "ether");
        //         gateway.disconnect();  
        //         return {
        //             status: true,
        //             message: payload
        //         };
        //     }
        //     else if(arg.chainCodeName === 'bridge') {
        //         console.log('2-MintAndTransfer >> ')
        //         const transaction = contract.createTransaction(arg.fcn);
        //         result = 
        //         await transaction.submit(JSON.stringify(
        //             {
        //                 Id: arg.id,
        //                 Key: arg.key,
        //                 User: arg.walletAddress,
        //                 value: value,
        //                 Message: arg.messageHash,
        //                 Signature: arg.signature
        //             }
        //         ));
        //         payload = JSON.parse(result.toString());
        //         payload.Value = web3.utils.fromWei(payload.Value, "ether");
        //         payload.txHash = transaction.getTransactionId();
        //         gateway.disconnect();
        //         return {
        //             status: true,
        //             message: payload
        //         };
        //     }

        // } catch (error) {
        //     console.log(`MintAndTransfer error: ${error.message}, arg: ${JSON.parse(arg)}`)
        //     logger.error(`MintAndTransfer error: ${error.message}, arg: ${arg}`);
        //     return {
        //         status: false,
        //         message: splitString(error.message)
        //     }
        // }
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
                
            // submitTransaction(func, wallet-address)
            let result = await contract.submitTransaction(arg.fcn, connection.connectOptions.identity, arg.messageHash, arg.signature);
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


