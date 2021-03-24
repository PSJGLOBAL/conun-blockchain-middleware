const { Gateway } = require('fabric-network');
const connectionOrg = require('../helper/conection')



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

    async allowance(fcn, ipfsHash, walletAddress) {
        try {
            let result = await this.contract.evaluateTransaction(fcn, ipfsHash, walletAddress);
            console.log('result: ', result.toString())
            return result.toString();
        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    }

    async getTotalLikes(fcn, ipfsHash ) {
        try {
            let result = await this.contract.evaluateTransaction(fcn, ipfsHash);
            console.log('result: ', result.toString())
            return JSON.parse(result.toString());
        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    }

    async getTotalDownloads(fcn, ipfsHash ) {
        try {
            let result = await this.contract.evaluateTransaction(fcn, ipfsHash);
            console.log('result: ', result.toString())
            return JSON.parse(result.toString());
        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    }

}


module.exports = {
    AllowanceFile: async (arg) => {
        try {
            const queryDrive = new QueryDriveNetworkClass();
            await queryDrive.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                queryDrive.allowance(arg.fcn, arg.ipfsHash, arg.walletAddress)
                    .then((response) =>  {
                        resolve(response);
                    }).catch((err) =>  {
                    console.log('err', err)
                    reject(false)
                }).finally(() => {
                    queryDrive.disconnect()
                })
            })
        } catch (e) {
            console.log('CreateFile: ', e)
            return false
        }
    },


    GetTotalLikesFile: async (arg) => {
        try {
            const queryDrive = new QueryDriveNetworkClass();
            await queryDrive.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                queryDrive.getTotalLikes(arg.fcn, arg.ipfsHash)
                    .then((response) =>  {
                        resolve(response);
                    }).catch((err) =>  {
                    console.log('err', err)
                    reject(false)
                }).finally(() => {
                    queryDrive.disconnect()
                })
            })
        } catch (e) {
            console.log('CreateFile: ', e)
            return false
        }
    },


    GetTotalDownloads: async (arg) => {
        try {
            const queryDrive = new QueryDriveNetworkClass();
            await queryDrive.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                queryDrive.getTotalDownloads(arg.fcn, arg.ipfsHash)
                    .then((response) =>  {
                        resolve(response);
                    }).catch((err) =>  {
                    console.log('err', err)
                    reject(false)
                }).finally(() => {
                    queryDrive.disconnect()
                })
            })
        } catch (e) {
            console.log('CreateFile: ', e)
            return false
        }
    }
}
