const { Gateway } = require('fabric-network');
const connectionOrg = require('../helper/conection')

const Helper = require("../../common/helper");
const logger = Helper.getLogger("app/drive/query");

function splitString(msg) {
    try {
        const [name, error] = msg.split('\n');
        const [peer, status, message] = error.split(', ');
        return name + message
    } catch (e) {
        logger.error('splitString err: ', e);
        return msg
    }
}


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
            return {
                status: true,
                message: result.toString()
            }
        } catch (error) {
            logger.error(`allowance error: ${error.message}, fcn: ${fcn}, ccid: ${ccid}, walletAddress: ${walletAddress} `);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }

    async getTotalLikes(fcn, ccid ) {
        try {
            let result = await this.contract.evaluateTransaction(fcn, ccid);
            logger.info('result: ', result.toString())
            return {
                status: true,
                message: JSON.parse(result.toString())
            }
        } catch (error) {
            logger.error(`getTotalLikes error: ${error.message}, fcn: ${fcn}, ccid: ${ccid}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }

    async getTotalDownloads(fcn, ccid ) {
        try {
            let result = await this.contract.evaluateTransaction(fcn, ccid);
            logger.info('result: ', result.toString())
            return {
                status: true,
                message: JSON.parse(result.toString())
            }
        } catch (error) {
            logger.error(`getTotalDownloads error: ${error.message}, fcn: ${fcn}, ccid: ${ccid}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }

    async getFile(fcn, ccid, walletAddress) {
        try {
            let result = await this.contract.evaluateTransaction(fcn, ccid, walletAddress);
            logger.info('result: ', result.toString());
            return {
                status: true,
                message: JSON.parse(result.toString())
            }
        } catch (error) {
            logger.error(`getFile error: ${error.message}, fcn: ${fcn}, ccid: ${ccid}, walletAddress: ${walletAddress}` );
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
                    }).catch((error) =>  {
                    logger.error(`AllowanceFile 1: ${error}`, arg);
                    reject(error)
                }).finally(() => {
                    queryDrive.disconnect()
                })
            })
        } catch (error) {
            logger.error(`AllowanceFile 2: ${error}`, arg);
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
                    }).catch((error) =>  {
                    logger.error(`AllowanceFile 1: ${error}`, arg);
                    reject(error)
                }).finally(() => {
                    queryDrive.disconnect()
                })
            })
        } catch (error) {
            logger.error(`AllowanceFile 2: ${error}`, arg);
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
                    }).catch((error) =>  {
                    logger.error(`GetTotalDownloads 1: ${error}`, arg);
                    reject(error)
                }).finally(() => {
                    queryDrive.disconnect()
                })
            })
        } catch (error) {
            logger.error(`GetTotalDownloads 2: ${error}`, arg);
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
                    logger.error(`GetFile 1: ${error}`, arg);
                    reject(error)
                }).finally(() => {
                    queryDrive.disconnect()
                })
            })
        } catch (error) {
            logger.error(`GetFile 2: ${error}`, arg);
            return {
                status: false,
                message: error
            }
        }
    }
}
