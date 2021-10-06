const Web3 = require('web3');
const config = require('config');
const Invoke = require('../app/invoke');
const {Swap} = require('../models/profile/swap.model');
const {User} = require('../models/profile/user');
require('../startup/db')();
const Helper = require('../common/helper');
const logger = Helper.getLogger('app');

class EtherEvent {
    constructor(contractAddress, abi, url) {
        this.contractAddress = contractAddress;
        this.abi = abi;
        this.url = url;
        this.provider = new Web3.providers.WebsocketProvider(this.url);
        this.web3 = new Web3(this.provider);
        this.listenContract = new this.web3.eth.Contract(this.abi, this.contractAddress);
    }
    
    querySwapID(queryData) {
        return new Promise (
            (resolve, reject) => {
                queryData.returnValues = JSON.parse(JSON.stringify(queryData.returnValues).replace('Result', ''));
                User.findOne({walletAddress: queryData.returnValues.from.toLowerCase()})
                    .then((user) => {
                        Swap.findOne({wallet: user._id , swapID: queryData.returnValues.swapID})
                            .then((swap) => {
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
                console.log('swapCONtoCONX >>');
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
                    console.log('response: ', response)
                    const filter = {
                        wallet: ivoke.user._id,
                        swapID: ivoke.queryData.returnValues.swapID,
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
                            console.log('ethereumTx', ivoke.ethereumTx.ethereumTx)
                            console.log('conunTX', response.message.txHash);
                            resolve(conunTX);    
                        })
                        .catch((err) => {
                            reject(err)
                        })
                    
                })
                .catch((error) => {
                    reject(error);
            });       
            }
        );
    }

    swapCONXtoCON(ivoke) {
        return new Promise(
            (resolve, reject) => {
                const invokeHandler = new Invoke();
                invokeHandler.burnFromBridge({
                    channelName: 'BurnFrom',
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
                    const filter = {
                        wallet: ivoke.user._id,
                        swapID: ivoke.queryData.returnValues.swapID,
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
                            console.log('ethereumTx', ivoke.ethereumTx.ethereumTx)
                            console.log('conunTX', response.message.txHash);
                            resolve(response);
                        })
                        .catch((err) => {
                            reject(err)
                        })
                })
                .catch((error) => {
                    reject(error);
                });       
            }
        );
    }

    listenEvent() {
        this.listenContract.events.allEvents()
        .on('connected', (id) => {
            console.log('Ethereum EVENT CONNECTED', id);
        })
        .on('data', (data) => {
            if(data.event === 'CONtoCONX') {
                this.querySwapID(data)
                    .then((invoke) => {
                        this.swapCONtoCONX(invoke)
                    })
                    .catch((error) => {
                        console.log('querySwapID - > error: ', error)
                        logger.error(`querySwapID error: ${error}`);
                    })
            }
            else if(data.event === 'CONXtoCON')
            {
                this.querySwapID(data)
                    .then((invoke) => {
                        this.swapCONXtoCON(invoke)
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

let BridgeContractAddress = config.get('ethereum.bridge_contract_address');
let bridgeAbiJson = require('../app/web3/bridge.swap.abi.json');
let url = config.get('ethereum.wsProvider');

const etherEvent = new EtherEvent(BridgeContractAddress, bridgeAbiJson, url);
etherEvent.listenEvent();