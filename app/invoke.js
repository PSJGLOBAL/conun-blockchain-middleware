const { Gateway } = require('fabric-network');
const connectionOrg = require('./helper/conection');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(process.env.ETHER_HTTP_PROVIDER);
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
                    logger.error(`swapMintAndTransfer error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.transaction.getTransactionId()
                    });
                    this.gateway.disconnect();
                })
            }
        )   
    }

    async swapBurnFrom(arg) {
        console.log('2-swapBurnFrom >> ', arg)
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
                    logger.error(`swapBurnFrom error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.transaction.getTransactionId()
                    });
                    this.gateway.disconnect();
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
                this.transaction.submit(arg.toAddress, value, arg.messageHash, arg.signature)
                .then((result) => {
                    this.payload = JSON.parse(result.toString());
                    this.payload.Func.Value = web3.utils.fromWei(this.payload.Func.Value, "ether");
                    this.payload.txHash = this.transaction.getTransactionId();
                    console.log('this.payload >>', this.payload);
                    this.gateway.disconnect();
                    resolve({
                        status: true,
                        message: this.payload
                    });
                })
                .catch((error) => {
                    logger.error(`conxMintAndTransfer error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.transaction.getTransactionId()
                    });
                    this.gateway.disconnect();
                })
            }
        ) 
    }
    
    async conxBurnFrom(arg) {
        console.log('2-conxBurnFrom >> ', arg)
        await this.connect(arg)
        return new Promise (
            (resolve, reject) => {
                let value = web3.utils.toWei(arg.amount, 'ether');
                this.transaction = this.contract.createTransaction(arg.fcn)
                this.transaction.submit(arg.fromAddress, value, arg.messageHash, arg.signature)
                .then((result) => {
                    this.payload = JSON.parse(result.toString());
                    this.payload.Func.Value = web3.utils.fromWei(this.payload.Func.Value, "ether");
                    this.payload.txHash = this.transaction.getTransactionId();
                    console.log('this.payload >>', this.payload);
                    this.gateway.disconnect();
                    resolve({
                        status: true,
                        message: this.payload
                    });
                })
                .catch((error) => {
                    logger.error(`conxBurnFrom error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.transaction.getTransactionId()
                    });
                    this.gateway.disconnect();
                })
            }
        ) 
    }

    async conxTransfer(arg) {
        console.log('2-conxTransfer >> ', arg)
        await this.connect(arg)
        return new Promise (
            (resolve, reject) => {
                let value = web3.utils.toWei(arg.amount, 'ether');
                this.transaction = this.contract.createTransaction(arg.fcn)
                this.transaction.submit(arg.walletAddress, arg.to, value, arg.messageHash, arg.signature)
                .then((result) => {
                    this.payload = JSON.parse(result.toString());
                    this.payload.Func.Value = web3.utils.fromWei(this.payload.Func.Value, "ether");
                    this.payload.txHash = this.transaction.getTransactionId();
                    console.log('this.payload >>', this.payload);
                    this.gateway.disconnect();
                    resolve({
                        status: true,
                        message: this.payload
                    });
                })
                .catch((error) => {
                    logger.error(`conxTransfer error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.transaction.getTransactionId()
                    });
                    this.gateway.disconnect();
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
                    logger.error(`initContract error: ${error.message}, arg: ${arg}`);
                    reject({
                        status: false,
                        message: splitString(error.message),
                        txHash: this.transaction.getTransactionId()
                    });
                    this.gateway.disconnect();
                })
            }
        ) 
    }
}