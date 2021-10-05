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

console.log('invoke class');

module.exports = class Invoke {
    constructor() {
        this.connection = null;
        this.gateway = null;
        this.network = null;
        this.contract = null;
        this.transaction = null;
        this.payload = null;
    }

    async connect (arg) {
        this.connection = await connectionOrg(arg.walletAddress, arg.orgName);
        // Create a new gateway for connecting to our peer node.
        this.gateway = new Gateway();
        await this.gateway.connect(this.connection.ccp, this.connection.connectOptions);

        // Get the network (channel) our contract is deployed to.
        this.network = await this.gateway.getNetwork(arg.channelName);
        this.contract = this.network.getContract(arg.chainCodeName);
    }

    swapMintAndTransfer (arg) {
        console.log('2-MintAndTransfer >> ')
        return new Promise (
            (resolve, reject) => {
                connectionOrg(arg.walletAddress, arg.orgName)
                    .then((connection) => {
                        this.connection = connection;
                        this.gateway = new Gateway();
                        this.gateway.connect(this.connection.ccp, this.connection.connectOptions)
                            .then(() => {
                                this.gateway.getNetwork(arg.channelName)
                                    .then((network) => {
                                    this.network = network;
                                    this.contract = this.network.getContract(arg.chainCodeName);
                                        let value = web3.utils.toWei(arg.amount, 'ether');
                                        this.transaction = this.contract.createTransaction(arg.fcn)
                                        this.transaction.submit(JSON.stringify(
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
                                            this.payload = JSON.parse(result.toString());
                                            this.payload.Value = web3.utils.fromWei(this.payload.Value, "ether");
                                            this.payload.txHash = this.transaction.getTransactionId();
                                            this.gateway.disconnect();
                                            resolve({
                                                status: true,
                                                message: this.payload
                                            });
                                        })
                                        .catch((error) => {
                                            reject(error);
                                        })
                                        this.gateway.disconnect(); 
                                    }
                                )
                            }
                        )
                    }
                )
            }
        )   
    }

    conxMintAndTransfer(arg) {
        
    }

    transfer(arg) {

    }


    burnFrom(arg) {

    }

    init(arg) {

    }
}