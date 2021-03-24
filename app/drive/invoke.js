const { Gateway } = require('fabric-network');
const connectionOrg = require('../helper/conection')

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

    async _create(fcn, ipfsHash, authorWalletAddress) {
        try {
            let result = await this.contract.submitTransaction(fcn, ipfsHash, authorWalletAddress);
            return JSON.parse(result.toString());
        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    }

    async approve(fcn, ipfsHash, author, spenders ) {
        try {
            let objSpender = {};
            for (const spender of spenders) {
                let result = await this.contract.submitTransaction(fcn, ipfsHash, author, spender);
                objSpender[spender] = JSON.parse(result.toString());
            }
            return objSpender
        } catch (e) {
            console.log(`Getting error: ${error}`)
            return false
        }
    }


    async allowance(fcn, ipfsHash, spender) {
        try {
            let result = await this.contract.submitTransaction(fcn, ipfsHash, spender);
            return JSON.parse(result.toString());
        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    }


    async likeContent(fcn, ipfsHash, walletAddress ) {
        try {
            let result = await this.contract.submitTransaction(fcn, ipfsHash, walletAddress);
            return JSON.parse(result.toString());
        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    }


    async countDownloads(fcn, ipfsHash, walletAddress ) {
        try {
            let result = await this.contract.submitTransaction(fcn, ipfsHash, walletAddress);
            return JSON.parse(result.toString());
        } catch (error) {
            console.log(`Getting error: ${error}`)
            return false
        }
    }

}


module.exports = {
    CreateFile: async (arg) => {
       try {
           const driveNetwork = new InvokeDriveNetworkClass();
           await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
           return new Promise((resolve, reject) => {
               driveNetwork._create(arg.fcn, arg.ipfsHash, arg.walletAddress)
               .then((response) =>  {
                   resolve(response);
               }).catch((err) =>  {
                   console.log('err', err)
                   reject(false)
               }).finally(() => {
                   driveNetwork.disconnect()
               })
           })
       } catch (e) {
           console.log('CreateFile: ', e)
           return false
       }
    },

    ApproveFile: async (arg) => {
        try {
            console.log('ApproveFile arg: ', arg);
            const driveNetwork = new InvokeDriveNetworkClass();
            await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.author);
            return new Promise((resolve, reject) => {
                driveNetwork.approve(arg.fcn, arg.ipfsHash, arg.author, arg.spenders)
                    .then((response) =>  {
                        console.log('approve response: ', response)
                        resolve(response);
                    }).catch((err) =>  {
                    console.log('err', err)
                    reject(false)
                }).finally(() => {
                    driveNetwork.disconnect()
                })
            })
        } catch (e) {
            console.log('CreateFile: ', e)
            return false
        }
    },

    LikeContentFile: async (arg)  => {
        try {
            console.log('LikeContentFile arg: ', arg);
            const driveNetwork = new InvokeDriveNetworkClass();
            await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                driveNetwork.likeContent(arg.fcn, arg.ipfsHash, arg.walletAddress)
                    .then((response) =>  {
                        console.log('likeContent response: ', response)
                        resolve(response);
                    }).catch((err) =>  {
                    console.log('err', err)
                    reject(false)
                }).finally(() => {
                    driveNetwork.disconnect()
                })
            })
        } catch (e) {
            console.log('LikeContentFile: ', e)
            return false
        }
    },


    CountDownloadsFile: async (arg)  => {
        try {
            console.log('CountDownloadsFile arg: ', arg);
            const driveNetwork = new InvokeDriveNetworkClass();
            await driveNetwork.connect(arg.orgName, arg.channelName, arg.chainCodeName, arg.walletAddress);
            return new Promise((resolve, reject) => {
                driveNetwork.countDownloads(arg.fcn, arg.ipfsHash, arg.walletAddress)
                    .then((response) =>  {
                        console.log('countDownloads response: ', response)
                        resolve(response);
                    }).catch((err) =>  {
                    console.log('err', err)
                    reject(false)
                }).finally(() => {
                    driveNetwork.disconnect()
                })
            })
        } catch (e) {
            console.log('CountDownloadsFile: ', e)
            return false
        }
    }
}
