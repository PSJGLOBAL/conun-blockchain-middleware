const { Gateway } = require('fabric-network');
const connectionOrg = require('../helper/conection');
const Helper = require("../../common/helper");

const logger = Helper.helper.getLogger("InvokeDrive")

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
            return JSON.parse(result.toString());
        } catch (error) {
            logger.error(`Getting error: ${error}`)
            return false
        }
    }

    async approve(fcn, ccid, author, spenders ) {
        try {
            let objSpender = {};
            for (const spender of spenders) {
                let result = await this.contract.submitTransaction(fcn, ccid, author, spender);
                objSpender[spender] = JSON.parse(result.toString());
            }
            return objSpender
        } catch (e) {
            logger.error(`Getting error: ${error}`)
            return false
        }
    }

    async likeContent(fcn, ccid, walletAddress, args) {
        try {
            let result = await this.contract.submitTransaction(fcn, ccid, walletAddress,JSON.stringify(args));
            
            return JSON.parse(result.toString());
        } catch (error) {
            logger.error(`Getting error: ${error}`)
            return false
        }
    }


    async countDownloads(fcn, ccid, walletAddress, args ) {
        try {
            let result = await this.contract.submitTransaction(fcn, ccid, walletAddress, JSON.stringify(args));
            return JSON.parse(result.toString());
        } catch (error) {
            logger.error(`Getting error: ${error}`)
            return false
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
               }).catch((err) =>  {
                   logger.error('err', err)
                   reject(false)
               }).finally(() => {
                   driveNetwork.disconnect()
               })
           })
       } catch (e) {
           logger.error('CreateFile: ', e)
           return false
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
            logger.info('ApproveFile arg: ', arg);
            const driveNetwork = new InvokeDriveNetworkClass();
            await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.author);
            return new Promise((resolve, reject) => {
                driveNetwork.approve(arg.fcn, arg.ccid, arg.author, arg.spenders)
                    .then((response) =>  {
                        logger.info('approve response: ', response)
                        resolve(response);
                    }).catch((err) =>  {
                        logger.error('err', err)
                    reject(false)
                }).finally(() => {
                    driveNetwork.disconnect()
                })
            })
        } catch (e) {
            logger.error('CreateFile: ', e)
            return false
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
            logger.info('LikeContentFile arg: ', arg,);
            const driveNetwork = new InvokeDriveNetworkClass();
            await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                driveNetwork.likeContent(arg.fcn, arg.ccid, arg.walletAddress, arg.args)
                    .then((response) =>  {
                        logger.info('likeContent response: ', response)
                        resolve(response);
                    }).catch((err) =>  {
                        logger.error('err', err)
                    reject(false)
                }).finally(() => {
                    driveNetwork.disconnect()
                })
            })
        } catch (e) {
            logger.error('LikeContentFile: ', e)
            return false
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
            logger.info('CountDownloadsFile arg: ', arg);
            const driveNetwork = new InvokeDriveNetworkClass();
            await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                driveNetwork.countDownloads(arg.fcn, arg.ccid, arg.walletAddress, arg.args)
                    .then((response) =>  {
                        logger.info('countDownloads response: ', response)
                        resolve(response);
                    }).catch((err) =>  {
                        logger.error('err', err)
                    reject(false)
                }).finally(() => {
                    driveNetwork.disconnect()
                })
            })
        } catch (e) {
            logger.error('CountDownloadsFile: ', e)
            return false
        }
    }
}
