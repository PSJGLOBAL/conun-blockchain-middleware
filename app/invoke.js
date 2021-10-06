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
        this.gateway = new Gateway();
        await this.gateway.connect(this.connection.ccp, this.connection.connectOptions);
        this.network = await this.gateway.getNetwork(arg.channelName);
        this.contract = this.network.getContract(arg.chainCodeName);
    }

    async swapMintAndTransfer (arg) {
        console.log('2-swapMintAndTransfer >> ', arg)
        await this.connect(arg)
        return new Promise (
            (resolve, reject) => {
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
                    this.payload = JSON.parse(result.toString());
                    this.payload.Value = web3.utils.fromWei(this.payload.Value, "ether");
                    this.payload.txHash = this.transaction.getTransactionId();
                    console.log('this.payload >>', this.payload);
                    this.gateway.disconnect();
                    resolve({
                        status: true,
                        message: this.payload
                    });
                })
                .catch((error) => {
                    this.payload.txHash = this.transaction.getTransactionId();
                    this.gateway.disconnect();
                    logger.error(`swapMintAndTransfer error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.payload.txHash
                    });
                })
            }
        )   
    }

    async conxMintAndTransfer(arg) {
        console.log('2-conxMintAndTransfer >> ', arg)
        await this.connect(arg)
        return new Promise (
            (resolve, reject) => {
                let value = web3.utils.toWei(arg.amount, 'ether');
                this.transaction = this.contract.createTransaction(arg.fcn)
                this.transaction.submit(arg.walletAddress, value, arg.messageHash, arg.signature)
                .then((result) => {
                    this.payload = JSON.parse(result.toString());
                    payload.Func.Value = web3.utils.fromWei(payload.Func.Value, "ether");
                    this.payload.txHash = this.transaction.getTransactionId();
                    console.log('this.payload >>', this.payload);
                    this.gateway.disconnect();
                    resolve({
                        status: true,
                        message: this.payload
                    });
                })
                .catch((error) => {
                    this.payload.txHash = this.transaction.getTransactionId();
                    this.gateway.disconnect();
                    logger.error(`conxMintAndTransfer error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.payload.txHash
                    });
                })
            }
        ) 
    }

    async burnFromBridge(arg) {
        console.log('2-burnFromBridge >> ', arg)
        await this.connect(arg)
        return new Promise (
            (resolve, reject) => {
                let value = web3.utils.toWei(arg.amount, 'ether');
                this.transaction = this.contract.createTransaction(arg.fcn)
                this.transaction.submit(JSON.stringify(
                    {
                    Id: arg.id,
                    User: arg.walletAddress,
                    Value: value,
                    Message: arg.messageHash,
                    Signature: arg.signature
                    }
                ))
                .then((result) => {
                    this.payload = JSON.parse(result.toString());
                    this.payload.Value = web3.utils.fromWei(this.payload.Value, "ether");
                    this.payload.txHash = this.transaction.getTransactionId();
                    console.log('this.payload >>', this.payload);
                    this.gateway.disconnect();
                    resolve({
                        status: true,
                        message: this.payload
                    });
                })
                .catch((error) => {
                    this.payload.txHash = this.transaction.getTransactionId();
                    this.gateway.disconnect();
                    logger.error(`burnFromBridge error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.payload.txHash
                    });
                })
            }
        )
    }
    
    async burnFromConx(arg) {
        console.log('2-burnFromConx >> ', arg)
        await this.connect(arg)
        return new Promise (
            (resolve, reject) => {
                let value = web3.utils.toWei(arg.amount, 'ether');
                this.transaction = this.contract.createTransaction(arg.fcn)
                this.transaction.submit(arg.walletAddress, value, arg.messageHash, arg.signature)
                .then((result) => {
                    this.payload = JSON.parse(result.toString());
                    payload.Func.Value = web3.utils.fromWei(payload.Func.Value, "ether");
                    this.payload.txHash = this.transaction.getTransactionId();
                    console.log('this.payload >>', this.payload);
                    this.gateway.disconnect();
                    resolve({
                        status: true,
                        message: this.payload
                    });
                })
                .catch((error) => {
                    this.payload.txHash = this.transaction.getTransactionId();
                    this.gateway.disconnect();
                    logger.error(`burnFromConx error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.payload.txHash
                    });
                })
            }
        ) 
    }

    async transferConx(arg) {
        console.log('2-transferConx >> ', arg)
        await this.connect(arg)
        return new Promise (
            (resolve, reject) => {
                let value = web3.utils.toWei(arg.amount, 'ether');
                this.transaction = this.contract.createTransaction(arg.fcn)
                this.transaction.submit(arg.walletAddress, value, arg.messageHash, arg.signature)
                .then((result) => {
                    this.payload = JSON.parse(result.toString());
                    payload.Func.Value = web3.utils.fromWei(payload.Func.Value, "ether");
                    this.payload.txHash = this.transaction.getTransactionId();
                    console.log('this.payload >>', this.payload);
                    this.gateway.disconnect();
                    resolve({
                        status: true,
                        message: this.payload
                    });
                })
                .catch((error) => {
                    this.payload.txHash = this.transaction.getTransactionId();
                    this.gateway.disconnect();
                    logger.error(`transferConx error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.payload.txHash
                    });
                })
            }
        ) 
    }


    async init(arg) {
        console.log('2-init Contract >> ', arg)
        await this.connect(arg)
        return new Promise (
            (resolve, reject) => {
                this.contract.submitTransaction(arg.fcn, arg.walletAddress, arg.messageHash, arg.signature)
                .then((result) => {
                    this.payload = JSON.parse(result.toString());
                    console.log('this.payload >>', this.payload);
                    this.gateway.disconnect();
                    resolve({
                        status: true,
                        message: this.payload
                    });
                })
                .catch((error) => {
                    this.payload.txHash = this.transaction.getTransactionId();
                    this.gateway.disconnect();
                    logger.error(`initContract error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.payload.txHash
                    });
                })
            }
        ) 
    }
}