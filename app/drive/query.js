const { Gateway } = require('fabric-network');
const connectionOrg = require('../helper/conection')

const Helper = require("../../common/helper");
const { reject } = require('lodash');

const logger = Helper.helper.getLogger("QueryDrive")


class QueryDriveNetworkClass {

    constructor() {
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

    async allowance(fcn, ccid, walletAddress) {
        try {
            let result = await this.contract.evaluateTransaction(fcn, ccid, walletAddress);
            logger.info('result: ', result.toString())
            return result.toString();
        } catch (error) {
            logger.info(`Getting error: ${error}`)
            return false
        }
    }

    async getTotalLikes(fcn, ccid ) {
        try {
            let result = await this.contract.evaluateTransaction(fcn, ccid);
            logger.info('result: ', result.toString())
            return JSON.parse(result.toString());
        } catch (error) {
            logger.error(`Getting error: ${error}`)
            return false
        }
    }

    async getTotalDownloads(fcn, ccid ) {
        try {
            let result = await this.contract.evaluateTransaction(fcn, ccid);
            logger.info('result: ', result.toString())
            return JSON.parse(result.toString());
        } catch (error) {
            logger.error(`Getting error: ${error}`)
            return false
        }
    }

    async getFile(fcn, ccid, walletAddress) {
        try {
            let result = await this.contract.evaluateTransaction(fcn, ccid, walletAddress);
            logger.info('result: ', result.toString());
            return JSON.parse(result.toString());
        } catch (error) {
            logger.error(`getting Error: ${error}`);
            return false;
        }
    }

}


module.exports = {
    /**
     * 
     * @param {*} arg 
     * @returns
     * @memberof DriveQuery 
     */
    AllowanceFile: async (arg) => {
        try {
            const queryDrive = new QueryDriveNetworkClass();
            await queryDrive.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                queryDrive.allowance(arg.fcn, arg.ccid, arg.walletAddress)
                    .then((response) =>  {
                        resolve(response);
                    }).catch((err) =>  {
                    logger.error('err', err)
                    reject(false)
                }).finally(() => {
                    queryDrive.disconnect()
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
     * @memberof DriveQuery 
     */
    GetTotalLikesFile: async (arg) => {
        try {
            const queryDrive = new QueryDriveNetworkClass();
            await queryDrive.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                queryDrive.getTotalLikes(arg.fcn, arg.ccid)
                    .then((response) =>  {
                        resolve(response);
                    }).catch((err) =>  {
                    logger.error('err', err)
                    reject(false)
                }).finally(() => {
                    queryDrive.disconnect()
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
     * @memberof DriveQuery 
     */
    GetTotalDownloads: async (arg) => {
        try {
            const queryDrive = new QueryDriveNetworkClass();
            await queryDrive.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                queryDrive.getTotalDownloads(arg.fcn, arg.ccid)
                    .then((response) =>  {
                        resolve(response);
                    }).catch((err) =>  {
                    logger.error('err', err)
                    reject(false)
                }).finally(() => {
                    queryDrive.disconnect()
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
     * @memberof DriveQuery 
     */
    GetFile: async (arg) => {
        try {
            const queryDrive = new QueryDriveNetworkClass();
            await queryDrive.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                queryDrive.getFile(arg.fcn, arg.ccid, arg.walletAddress)
                .then((response) => {
                    resolve(response);
                }).catch((error) => {
                    logger.error('error', error)
                    reject(false)
                }).finally(() => {
                    queryDrive.disconnect()
                })
            })
        } catch (e) {
            logger.error('GetFile ', e)
            return false
        }
    }
}
