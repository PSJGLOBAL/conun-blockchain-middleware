const express = require('express');
const router = express.Router();
const Web3 = require('web3');
const Invoke = require('../../../../app/invoke');
const {Swap} = require('../../../../models/profile/swap.model');
const {User} = require('../../../../models/profile/user');
const Helper = require('../../../../common/helper');
const Eth = require('../../../../app/web3/eth.main');
const logger = Helper.getLogger('app');

class EtherEvent {
    constructor(contractAddress, abi, url) {
        this.contractAddress = contractAddress;
        this.abi = abi;
        this.url = url;
        this.provider = new Web3.providers.WebsocketProvider(this.url);
        this.web3 = new Web3(this.provider);
        this.listenContract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        this.eventId = '0x10ff0df6efee9a32434b125162714037583cee42ce4d';
    }
    
    querySwapID(queryData, eventId) {
        return new Promise (
            (resolve, reject) => {
                console.log('queryData: ', queryData);
                User.findOne({walletAddress: queryData.from.toLowerCase()})
                    .then((user) => {
                        console.log('user: ', user);
                        Swap.findOne({wallet: user._id, swapID: queryData.swapID}, function(err, swap) {
                            console.log('swap: ', err, swap)
                            if(err)reject(err)
                            // if(!swap.eventId) {
                                Swap.findByIdAndUpdate(swap._id, 
                                    { ethereumTx: queryData.transactionHash, eventId: eventId, isComplited: false, }, {new: true})
                                    .then((ethereumTx) => {
                                        resolve({
                                            queryData,
                                            user,
                                            swap,
                                            ethereumTx
                                        }); 
                                    })
                                    .catch((err) => {
                                        logger.error('1-querySwapID', err);
                                        reject(err)
                                    })
                            // } else {
                            //     reject(`event already handeled by woker id ${swap.eventId}`)
                            // }
                        })                            
                })
                .catch((err) => {
                    logger.error('3-querySwapID', err);
                    reject(err)
                })       
            }
        )
    }

    swapCONtoCONX(invoke) {
        return new Promise(
            (resolve, reject) => {
                logger.info('invoke swapCONtoCONX:', invoke);
                const invokeHandler = new Invoke();
                invokeHandler.swapMintAndTransfer({
                    channelName: 'mychannel',
                    chainCodeName: 'bridge',
                    fcn: 'MintAndTransfer',
                    orgName: invoke.user.orgName,
                    id: invoke.swap.swapID.slice(2, invoke.swap.swapID.length),
                    key: invoke.swap.swapKey.slice(2, invoke.swap.swapKey.length),
                    walletAddress: invoke.user.walletAddress,
                    amount: invoke.swap.amount,
                    messageHash: invoke.swap.messageHash,
                    signature: invoke.swap.signature
                })
                .then((response) => {
                    logger.info('>>> swapCONtoCONX:', response);
                    console.log('response: ', response)
                    const filter = {
                        wallet: invoke.user._id,
                        swapID: invoke.queryData.swapID,
                        amount: response.message.Value
                    }
                    const update = {
                        amount: response.message.Value,
                        conunTx: response.message.txHash,
                        isComplited: true,
                        complitedAt: Date.now()
                    }
                    Swap.findOneAndUpdate(filter, update, {new: true})
                        .then((conunTX) => {
                            logger.info('conunTX:', conunTX);
                            resolve(conunTX);    
                        })
                        .catch((err) => {
                            logger.error('1-swapCONtoCONX', err);
                            reject(err)
                        })
                    
                })
                .catch((error) => {
                    logger.error('2-swapCONtoCONX', error);
                    reject(error);
            });       
            }
        );
    }

    swapCONXtoCON(invoke) {
        return new Promise(
            (resolve, reject) => {
                logger.info('invoke swapCONXtoCON:', invoke);
                const invokeHandler = new Invoke();
                invokeHandler.swapBurnFrom({
                    channelName: 'mychannel',
                    chainCodeName: 'bridge',
                    fcn: 'BurnFrom',
                    orgName: invoke.user.orgName,
                    id: invoke.swap.swapID.slice(2, invoke.swap.swapID.length),
                    walletAddress: invoke.user.walletAddress,
                    amount: invoke.swap.amount,
                    messageHash: invoke.swap.messageHash,
                    signature: invoke.swap.signature
                })
                .then((response) => {
                    logger.info('>>> swapCONXtoCON:', response);
                    const filter = {
                        wallet: invoke.user._id,
                        swapID: invoke.queryData.swapID,
                        amount: response.message.Value
                    }
                    const update = {
                        amount: response.message.Value,
                        conunTx: response.message.txHash,
                        isComplited: true,
                        complitedAt: Date.now()
                    }
                    Swap.findOneAndUpdate(filter, update, {new: true})
                        .then((response) => {
                            logger.info('conunTX:', response);
                            resolve(response);
                        })
                        .catch((err) => {
                            logger.error('1-swapCONXtoCON', err);
                            reject(err)
                        })
                })
                .catch((error) => {
                    logger.error('2-swapCONXtoCON', error);
                    reject(error);
                });       
            }
        );
    }

    listenEvent(swapType, body) {
        // this.eventId = '0x6177b34b6289891fb'
        if(swapType === 'CONtoCONX') 
        {
            this.querySwapID(body, this.eventId)
                .then((invoke) => {
                    this.swapCONtoCONX(invoke)
                })
                .catch((error) => {
                    console.log('querySwapID - > error: ', error)
                    logger.error(`querySwapID error: ${error}`);
                })
        }
        else if(swapType === 'CONXtoCON')
        {
            this.querySwapID(body, this.eventId)
                .then((invoke) => {
                    this.swapCONXtoCON(invoke)
                })
                .catch((error) => {
                    console.log('querySwapID -> error: ', error)
                    logger.error(`querySwapID error: ${error}`);
                }) 
        }             
    }
}

let BridgeContractAddress = process.env.ETHER_BRIDGE_CONTRACT_ADDRESS;
let url = process.env.ETHER_WS_PROVIDER;
const bridgeAbiJson = require('../../../../app/web3/bridge.swap.abi.json');
const etherEvent = new EtherEvent(BridgeContractAddress, bridgeAbiJson, url);

router.post('/make-swap/type/:swapType', async (req, res) => {
    console.log('>> >>')
    etherEvent.listenEvent(req.params.swapType, req.body);
    res.json({ success: true, message: 'success' }).status(200);
});
module.exports = router;