const { Gateway } = require('fabric-network');
const connectionOrg = require('./helper/conection');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(process.env.ETHER_HTTP_PROVIDER);
const web3 = new Web3(provider);
const Helper = require('../common/helper');
const logger = Helper.getLogger('app/invoke');


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
        try {
            await this.connect(arg);
            let value = web3.utils.toWei(arg.amount, 'ether');
            this.transaction = this.contract.createTransaction(arg.fcn)
            let result = await this.transaction.submit(JSON.stringify(
                {
                    Id: arg.id,
                    Key: arg.key,
                    User: arg.walletAddress,
                    Value: value,
                    Message: arg.messageHash,
                    Signature: arg.signature
                }
            ))
            this.payload = JSON.parse(result.toString());
            this.payload.Value = web3.utils.fromWei(this.payload.Value, "ether");
            this.payload.txHash = this.transaction.getTransactionId();
            this.payload.status = true
            this.gateway.disconnect();
            return this.payload
        } catch(error) {
            this.gateway.disconnect();
            logger.error(`swapMintAndTransfererror: ${error}, Function: ${arg.fcn}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }   
    }

    async swapBurnFrom(arg) {
        try {
            await this.connect(arg);
            let value = web3.utils.toWei(arg.amount, 'ether');
            this.transaction = this.contract.createTransaction(arg.fcn)
            let result = await this.transaction.submit(JSON.stringify(
                {
                    Id: arg.id,
                    User: arg.walletAddress,
                    Value: value,
                    Message: arg.messageHash,
                    Signature: arg.signature
                }
            ))
            this.payload = JSON.parse(result.toString());
            this.payload.Value = web3.utils.fromWei(this.payload.Value, "ether");
            this.payload.txHash = this.transaction.getTransactionId();
            this.payload.status = true
            this.gateway.disconnect();
            return this.payload
        } catch (error) {
            this.gateway.disconnect();
            logger.error(`swapMintAndTransfererror: ${error}, Function: ${arg.fcn}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }

    async conxMintAndTransfer(arg) {
        try {
            await this.connect(arg);
            let value = web3.utils.toWei(arg.amount, 'ether');
            this.transaction = this.contract.createTransaction(arg.fcn)
            let result = await this.transaction.submit(arg.toAddress, value, arg.messageHash, arg.signature, arg.mintId);
            this.payload = JSON.parse(result.toString());
            this.payload.Func.Value = web3.utils.fromWei(this.payload.Func.Value, "ether");
            this.payload.txHash = this.transaction.getTransactionId();
            this.payload.status = true
            this.gateway.disconnect();
            return this.payload;
        } catch (error) {
            this.gateway.disconnect();
            logger.error(`swapMintAndTransfererror: ${error}, Function: ${arg.fcn}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }
    
    async conxBurnFrom(arg) {
        try {
            await this.connect(arg);
            let value = web3.utils.toWei(arg.amount, 'ether');
            this.transaction = this.contract.createTransaction(arg.fcn)
            let result = await this.transaction.submit(arg.fromAddress, value, arg.messageHash, arg.signature, arg.burnId);
            this.payload = JSON.parse(result.toString());
            this.payload.Func.Value = web3.utils.fromWei(this.payload.Func.Value, "ether");
            this.payload.txHash = this.transaction.getTransactionId();
            this.payload.status = true
            this.gateway.disconnect();
            return this.payload;    
        } catch (error) {
            this.gateway.disconnect();
            logger.error(`swapMintAndTransfererror: ${error}, Function: ${arg.fcn}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        }
    }

    async conxTransfer(arg) {
        try {
            await this.connect(arg);
                let value = web3.utils.toWei(arg.amount, 'ether');
                this.transaction = this.contract.createTransaction(arg.fcn)
                let result = await this.transaction.submit(arg.walletAddress, arg.to, value, arg.messageHash, arg.signature)
                this.payload = JSON.parse(result.toString());
                this.payload.Func.Value = web3.utils.fromWei(this.payload.Func.Value, "ether");
                this.payload.txHash = this.transaction.getTransactionId();
                this.payload.status = true
                this.gateway.disconnect();
            return this.payload; 
        } catch (error) {
            this.gateway.disconnect();
            logger.error(`swapMintAndTransfererror: ${error}, Function: ${arg.fcn}`);
            return {
                status: false,
                message: splitString(error.message)
            }
        } 
    }


    async init(arg) {
        await this.connect(arg)
        return new Promise (
            (resolve, reject) => {
                this.contract.submitTransaction(arg.fcn, arg.walletAddress)
                .then((result) => {
                    this.payload = JSON.parse(result.toString());
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