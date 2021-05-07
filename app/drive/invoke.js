const { Gateway } = require('fabric-network');
const connectionOrg = require('../helper/conection');

const Helper = require("../../common/helper");
const logger = Helper.getLogger("InvokeDrive")

function splitString(msg) {
    try {
        const [name, error] = msg.split('\n');
        const [peer, status, message] = error.split(', ');
        console.log('name + message: ', name + message)
        return name + message
    } catch (e) {
        console.log('splitString err: ', e);
        return msg
    }
}


class InvokeDriveNetworkClass {

    constructor () {
    this.connection = null;
    this.contract = null;
    this.gateway = null;
    }

    async connect(orgName, channelName, chainCodeName, walletAddress) {
        this.connection = await connectionOrg(walletAddress, orgName);
        // Create a new gateway for connecting to our peer node.
        this.gateway = new Gateway();
        await this.gateway.connect(this.connection.ccp, this.connection.connectOptions);

        // Get the network (channel) our contract is deployed to.
        const network = await this.gateway.getNetwork(channelName);
        this.contract = network.getContract(chainCodeName);
    }

    async disconnect() {
        await this.gateway.disconnect();
    }

    async _create(fcn, content) {
        try {
            let result = await this.contract.submitTransaction(fcn, JSON.stringify(content));
            console.log('result: ', result);
            return {
                status: true,
                message: JSON.parse(result.toString())
            }
        } catch (error) {
            logger.error(`_create error: ${error}, Function: ${fcn}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }

    async approve(fcn, ccid, author, spenders) {
        try {
            let objSpender = {};
            for (const spender of spenders) {
                let result = await this.contract.submitTransaction(fcn, ccid, author, spender);
                objSpender[spender] = JSON.parse(result.toString());
            }
            return {
                status: true,
                message: objSpender
            }
        } catch (error) {
            logger.error(`approve error: ${error}, Function: ${fcn}, author: ${author}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }

    async likeContent(fcn, action) {
        try {
            logger.info(`Getting action: ${action}`);
            let result = await this.contract.submitTransaction(fcn, JSON.stringify(action));
            return {
                status: true,
                message: JSON.parse(result.toString())
            }

        } catch (error) {
            logger.error(`likeContent error: ${error.message}, Function: ${fcn}, Action: ${action}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }


    async countDownloads(fcn, action) {
        try {
            let result = await this.contract.submitTransaction(fcn, JSON.stringify(action));
            return {
                status: true,
                message: JSON.parse(result.toString())
            }
        } catch (error) {
            logger.error(`countDownloads error: ${error}, Function: ${fcn}, Action: ${action}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }

}


module.exports = {
    /**
     *
     * @param {*} arg
     * @returns
     * @memberof InvokeDrive
     */
    CreateFile: async (arg) => {
       try {
           const driveNetwork = new InvokeDriveNetworkClass();
           await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
           return new Promise((resolve, reject) => {
               driveNetwork._create(arg.fcn, arg.content)
               .then((response) =>  {
                   resolve(response);
               }).catch((error) => {
                   logger.error(`CreateFile 1: ${error}`, arg);
                   reject(error)
               }).finally(() => {
                   driveNetwork.disconnect()
               })
           })
       } catch (error) {
            logger.error(`CreateFile: Failed to evaluate transaction 2: ${error}`, arg);
           return {
               status: false,
               message: error
           }
       }
    },
    /**
     *
     * @param {*} arg
     * @returns
     * @memberof InvokeDrive
     */
    ApproveFile: async (arg) => {
        try {
            const driveNetwork = new InvokeDriveNetworkClass();
            await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.author);
            return new Promise((resolve, reject) => {
                driveNetwork.approve(arg.fcn, arg.ccid, arg.author, arg.spenders)
                    .then((response) =>  {
                        logger.info('approve response: ', response)
                        resolve(response);
                    }).catch((error) =>  {
                        logger.error(`ApproveFile 1: ${error}`, arg);
                    reject(error)
                }).finally(() => {
                    driveNetwork.disconnect()
                })
            })
        } catch (error) {
            logger.error(`ApproveFile: Failed to evaluate transaction 2: ${error}`, arg);
            return {
                status: false,
                message: error
            }
        }
    },
    /**
     *
     * @param {*} arg
     * @returns
     * @memberof InvokeDrive
     */
    LikeContentFile: async (arg)  => {
        try {
            const driveNetwork = new InvokeDriveNetworkClass();
            await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                driveNetwork.likeContent(arg.fcn, arg.action)
                    .then((response) =>  {
                        resolve(response);
                    }).catch((error) =>  {
                    logger.error(`LikeContentFile 1: ${error}`, arg);
                    reject(error)
                }).finally(() => {
                    driveNetwork.disconnect()
                })
            })
        } catch (error) {
            console.log(`LikeContentFile: Failed to evaluate transaction 2: ${error}`, arg);
            logger.error(`LikeContentFile: Failed to evaluate transaction 2: ${error}`, arg);
            return {
                status: false,
                message: error
            }
        }
    },

    /**
     *
     * @param {*} arg
     * @returns
     * @memberof InvokeDrive
     */
    CountDownloadsFile: async (arg)  => {
        try {
            const driveNetwork = new InvokeDriveNetworkClass();
            await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                driveNetwork.countDownloads(arg.fcn, arg.action)
                    .then((response) =>  {
                        resolve(response);
                    }).catch((error) =>  {
                        logger.error(`CountDownloadsFile 1: ${error}`, arg);
                        reject(error)
                }).finally(() => {
                    driveNetwork.disconnect()
                })
            })
        } catch (error) {
            logger.error(`CountDownloadsFile: Failed to evaluate transaction 2: ${error}`, arg);
            return {
                status: false,
                message: error
            }
        }
    }
}
