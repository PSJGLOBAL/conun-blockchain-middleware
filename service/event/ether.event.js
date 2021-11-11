const Web3 = require('web3');
const Invoke = require('../../app/invoke');
const {Swap} = require('../../models/profile/swap.model');
const {User} = require('../../models/profile/user');
const Helper = require('../../common/helper');
const logger = Helper.getLogger('worker');

module.exports = class EtherEvent {
    constructor(contractAddress, abi, url) {
        this.contractAddress = contractAddress;
        this.abi = abi;
        this.url = url;
        this.provider = new Web3.providers.WebsocketProvider(this.url, {
            reconnect: {
                auto: true,
                delay: 5000, // ms
                maxAttempts: 5,
                onTimeout: false,
              }
        });
        this.web3 = new Web3(this.provider);
        this.listenContract = new this.web3.eth.Contract(this.abi, this.contractAddress);
        this.eventId = null;
    }
    
    querySwapID(queryData, eventId) {
        return new Promise (
            (resolve, reject) => {
                queryData.returnValues = JSON.parse(JSON.stringify(queryData.returnValues).replace('Result', ''));
                User.findOne({walletAddress: queryData.returnValues.from.toLowerCase()})
                    .then((user) => {
                        Swap.findOne({wallet: user._id, swapID: queryData.returnValues.swapID})
                            .then((swap) => {
                                if(swap.eventId === eventId) {
                                    Swap.findByIdAndUpdate(swap._id, 
                                        { ethereumTx: queryData.transactionHash, isComplited: false, }, {new: true})
                                        .then((ethereumTx) => {
                                            resolve({
                                                queryData,
                                                user,
                                                swap,
                                                ethereumTx
                                            }); 
                                        })
                                        .catch((err) => {
                                            reject(err)
                                        })
                                } else {
                                    reject(`event already handeled by woker id ${swap.eventId}`)
                                }
                            })
                            .catch((err) => {
                                reject(err)
                            })
                })
                .catch((err) => {
                    reject(err)
                })       
            }
        )
    }

    swapCONtoCONX(ivoke) {
        return new Promise(
            (resolve, reject) => {
                const invokeHandler = new Invoke();
                invokeHandler.swapMintAndTransfer({
                    channelName: 'mychannel',
                    chainCodeName: 'bridge',
                    fcn: 'MintAndTransfer',
                    orgName: ivoke.user.orgName,
                    id: ivoke.swap.swapID.slice(2, ivoke.swap.swapID.length),
                    key: ivoke.swap.swapKey.slice(2, ivoke.swap.swapKey.length),
                    walletAddress: ivoke.user.walletAddress,
                    amount: ivoke.swap.amount,
                    messageHash: ivoke.swap.messageHash,
                    signature: ivoke.swap.signature
                })
                .then((response) => {
                    console.log('swapCONtoCONX -> response: ', response);
                    logger.info('swapCONtoCONX -> response: ', response);
                    if(!response.status) reject(response);
                    const filter = {
                        wallet: ivoke.user._id,
                        swapID: ivoke.queryData.returnValues.swapID,
                        amount: response.Value
                    }
                    const update = {
                        amount: response.Value,
                        conunTx: response.txHash,
                        isComplited: true,
                        complitedAt: Date.now()
                    }
                    Swap.findOneAndUpdate(filter, update, {new: true})
                        .then((conunTX) => {
                            logger.info('conunTX', response.conunTx);
                            resolve(conunTX);    
                        })
                        .catch((err) => {
                            logger.error('1-swapCONtoCONX err: ', err)
                            reject(err)
                        })
                    
                })
                .catch((error) => {
                    logger.error('2-swapCONtoCONX err: ', error)
                    reject(error);
            });       
            }
        );
    }

    swapCONXtoCON(ivoke) {
        return new Promise(
            (resolve, reject) => {
                const invokeHandler = new Invoke();
                invokeHandler.swapBurnFrom({
                    channelName: 'mychannel',
                    chainCodeName: 'bridge',
                    fcn: 'BurnFrom',
                    orgName: ivoke.user.orgName,
                    id: ivoke.swap.swapID.slice(2, ivoke.swap.swapID.length),
                    walletAddress: ivoke.user.walletAddress,
                    amount: ivoke.swap.amount,
                    messageHash: ivoke.swap.messageHash,
                    signature: ivoke.swap.signature
                })
                .then((response) => {
                    logger.info('swapCONXtoCON -> response: ', response)
                    if(!response.status) reject(response)
                    const filter = {
                        wallet: ivoke.user._id,
                        swapID: ivoke.queryData.returnValues.swapID,
                        amount: response.Value
                    }
                    const update = {
                        amount: response.Value,
                        conunTx: response.txHash,
                        isComplited: true,
                        complitedAt: Date.now()
                    }
                    Swap.findOneAndUpdate(filter, update, {new: true})
                        .then((response) => {
                            logger.info('conunTX', response.conunTx);
                            resolve(response);
                        })
                        .catch((err) => {
                            logger.error('1-swapCONXtoCON err: ', err)
                            reject(err)
                        })
                })
                .catch((error) => {
                    logger.error('2-swapCONXtoCON err: ', error)
                    reject(error);
                });       
            }
        );
    }

    listenEvent() {
        this.listenContract.events.allEvents()
        .on('connected', (id) => {
            logger.info('Ethereum EVENT CONNECTED', id);
            console.log('Ethereum EVENT CONNECTED', id);
            this.eventId = id;
        })
        .on('data', (data) => {
            console.log('>> Interupted Listen Event >>', this.eventId);
            if(data.event === 'CONtoCONX') {
                this.querySwapID(data, this.eventId)
                    .then((invoke) => {
                        this.swapCONtoCONX(invoke)
                            .catch((error) => {
                                console.log('swapCONtoCONX - > error: ', error)
                                logger.error(`swapCONtoCONX error: ${error}`);
                            })
                    })
                    .catch((error) => {
                        console.log('querySwapID - > error: ', error);
                        logger.error(`querySwapID error: ${error}`);
                    })
            }
            else if(data.event === 'CONXtoCON')
            {
                this.querySwapID(data, this.eventId)
                    .then((invoke) => {
                        this.swapCONXtoCON(invoke)
                            .catch((error) => {
                                console.log('swapCONXtoCON - > error: ', error);
                                logger.error(`swapCONXtoCON error: ${error}`);
                            })
                    })
                    .catch((error) => {
                        console.log('querySwapID -> error: ', error)
                        logger.error(`querySwapID error: ${error}`);
                    }) 
            }       
        })
        .on('error', (error) => {
            console.log('listenContractEvent err: ', error);
            logger.error(`listenContractEvent error: ${error}`);
        });
    }
}