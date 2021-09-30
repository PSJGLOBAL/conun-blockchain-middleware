const Web3 = require('web3');
const config = require('config');
const crypto = require('crypto');
const CallInvokeSwap = require('./helper/swap.conx');
const invokeHandler = require('../app/invoke');
const {Swap} = require('../models/profile/swap.model');
const {User} = require('../models/profile/user');
require('../startup/db')();

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
            async (resolve, reject) => {
            queryData.returnValues = JSON.parse(JSON.stringify(queryData.returnValues).replace('Result', ''));
            let user = await User.findOne({walletAddress: queryData.returnValues.from.toLowerCase()})
            let isExistTx = await Swap.findOne({ethereumTx: queryData.transactionHash});
            let swap = await Swap.findOne({wallet: user._id , swapID: queryData.returnValues.swapID})
            if(!isExistTx && swap) {
                let ethereumTx = await Swap.findByIdAndUpdate(swap._id,
                    {
                        ethereumTx: queryData.transactionHash,
                        isComplited: false,
                    },
                    {new: true});
    
                if(!ethereumTx) reject(false);
                resolve({
                    queryData,
                    user,
                    swap,
                    ethereumTx
                });      
            } else reject({reson: 'ethereumTx or swapID error:', isExistTx, swap })
        })
    }

    swapCONtoCONX(ivoke) {
        return new Promise(
            (resolve, reject) => {
                CallInvokeSwap('MintAndTransfer', {
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
                    .then(async (response) => {
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
                        let conunTX = await Swap.findOneAndUpdate(filter, update, {new: true});
                        if(!conunTX) reject(false);
                        resolve(conunTX);
                    })
                    .catch((error) => {
                        console.log('CallInvoke -> error', error);
                        reject(error);
                });       
            }
        );
    }

    swapCONXtoCON(ivoke) {
        return new Promise(
            (resolve, reject) => {
                CallInvokeSwap('BurnFrom', {
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
                    .then(async (response) => {
                        console.log('SWAP CON - res: ', response);
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
                        let conunTX = await Swap.findOneAndUpdate(filter, update, {new: true});
                        if(!conunTX) reject(false);
                        resolve(conunTX);
                    })
                    .catch((error) => {
                        console.log('CallInvoke -> error', error);
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
            if(data.event === 'CONtoCONX')
                this.querySwapID(data)
                    .then((invoke) => {
                        this.swapCONtoCONX(invoke)
                    })
                    .catch((error) => {
                        console.log('error: ', error)
                    })
            else if(data.event === 'CONXtoCON')
                    this.querySwapID(data)
                        .then((invoke) => {
                            this.swapCONXtoCON(invoke)
                        })
                        .catch((error) => {
                            console.log('error: ', error)
                        })        
        })
        .on('error', (err) => {
            console.log('listenContractEvent err: ', err);
        });
    }
}


let BridgeContractAddress = config.get('ethereum.bridge_contract_address');
let bridgeAbiJson = require('../app/web3/bridge.swap.abi.json');
let url = config.get('ethereum.wsProvider');

const etherEvent = new EtherEvent(BridgeContractAddress, bridgeAbiJson, url);
etherEvent.listenEvent();