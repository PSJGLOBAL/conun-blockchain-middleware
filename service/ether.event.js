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


    async querySwapID(data) {
        console.log('1-----------------')
        data.returnValues = JSON.parse(JSON.stringify(data.returnValues).replace('Result', ''));
        // console.log('data.returnValues: ', data.returnValues)
        

        if(data.event === 'NewDeposit') {
            let user = await User.findOne({walletAddress: data.returnValues.from.toLowerCase()})
    
            let swap = await Swap.findOne({wallet: user._id , swapID: data.returnValues.depositId})
            
            let ethereumTx = await Swap.findByIdAndUpdate(swap._id,
                {
                    ethereumTx: data.transactionHash,
                    isComplited: false,
                },
                {new: true})

            console.log('ethereumTx: ', ethereumTx);

            try {
                console.log('2-----------------')
                CallInvokeSwap('MintAndTransfer', {
                        channelName: 'mychannel',
                        chainCodeName: 'bridge',
                        fcn: 'MintAndTransfer',
                        orgName: 'Org1',
                        id: swap.swapID.slice(2, swap.swapID.length),
                        key: swap.swapKey.slice(2, swap.swapKey.length),
                        walletAddress: user.walletAddress,
                        amount: swap.amount,
                        messageHash: swap.messageHash,
                        signature: swap.signature
                    })
                    .then(async (response) => {
                        console.log('3-----------------')
                            console.log('CallInvoke -> response', response);
                            const filter = {
                                wallet: user._id,
                                swapID: data.returnValues.depositId,
                                amount: response.Value
                            }
                            const update = {
                                conunTx: response.txHash,
                                isComplited: true,
                                complitedAt: Date.now()
                            }
                        let conunTX = await Swap.findOneAndUpdate(filter, update, {new: true});
                        console.log('conunTx: ', conunTX);
                    }
                    ).catch((error) => {
                        console.log('1 - CallInvoke -> error', error);
                    });
                } catch (error) {
                    console.log('2 - CallInvoke -> error', error);
                }

        }
    }

    listenEvent() {
        this.listenContract.events.allEvents()
        .on('connected', (id) => {
            console.log('listenContractEvent connected', id);
        })
        .on('data', (data) => {
            // console.log('listenContractEvent', data);
            this.querySwapID(data)
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


// let _key = "0x70739850a5953fbd67d6c833a6c1ac981f63d5526b0ccc31b43f566f750f0837"
// console.log('ID>> ', crypto.createHash('sha256').update(_key.slice(2, _key.length), 'string').digest('hex'))



// etherEvent.querySwapID();

// (async() => {
//     let swap = await Swap.findOne({swapID: '0x65f530a5f270fbd5dae8882753afa3e6032445b8ff63f10b2faf499cffeec30c'});
// console.log('swap: ', swap);
// })();


// (async() => {
//     let swap = await Swap.findById('6143f2033a21e2001368011b')
//     console.log('swap', swap);
// })();