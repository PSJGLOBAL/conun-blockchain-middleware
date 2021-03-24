// const { Gateway } = require('fabric-network');
// const connectionOrg = require('./helper/conection')
//
// module.exports = {
//     BalanceOf: async (arg) => {
//         try {
//             console.log('arg: ', arg);
//             const connection = await connectionOrg(arg.walletAddress, arg.orgName);
//             // Create a new gateway for connecting to our peer node.
//             const gateway = new Gateway();
//             await gateway.connect(connection.ccp, connection.queryConnectOptions);
//
//             // Get the network (channel) our contract is deployed to.
//             const network = await gateway.getNetwork(arg.channelName);
//
//             // Get the contract from the network.
//             const contract = network.getContract(arg.chainCodeName);
//
//             let result = await contract.evaluateTransaction(arg.fcn, arg.walletAddress);
//             console.log(`Transaction has been evaluated, result is: ${result}`);
//             return result.toString();
//         } catch (error) {
//             console.error(`Failed to evaluate transaction: ${error}`);
//             return false
//         }
//     },
//
//     GetDetails: async (arg) => {
//         try {
//             console.log('arg: ', arg);
//             const connection = await connectionOrg(arg.walletAddress, arg.orgName);
//             const gateway = new Gateway();
//             await gateway.connect(connection.ccp, connection.queryConnectOptions);
//             const network = await gateway.getNetwork(arg.channelName);
//             const contract = network.getContract(arg.chainCodeName);
//             let result = await contract.evaluateTransaction(arg.fcn);
//             console.log(`Transaction has been evaluated, result is: ${result}`);
//             return JSON.parse(result.toString());
//         } catch (error) {
//             console.error(`Failed to evaluate transaction: ${error}`);
//             return false
//         }
//     },
//
//     ClientAccountID: async (arg) => {
//         try {
//             console.log('arg: ', arg);
//             const connection = await connectionOrg(arg.walletAddress, arg.orgName);
//             const gateway = new Gateway();
//             await gateway.connect(connection.ccp, connection.queryConnectOptions);
//             const network = await gateway.getNetwork(arg.channelName);
//             const contract = network.getContract(arg.chainCodeName);
//             let result = await contract.evaluateTransaction(arg.fcn);
//             console.log(`Transaction has been evaluated, result is: ${result}`);
//             return result.toString();
//         } catch (error) {
//             console.error(`Failed to evaluate transaction: ${error}`);
//             return false
//         }
//     }
// }
