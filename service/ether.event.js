const Web3 = require('web3');
const config = require('config');
const crypto = require('crypto');
const CallInvoke = require('./helper/swap.conx');
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
        data.returnValues = JSON.parse(JSON.stringify(data.returnValues).replace('Result', ''));
        console.log('data.returnValues: ', data.returnValues)
        

        if(data.event === 'NewDeposit') {
            let user = await User.findOne({walletAddress: data.returnValues.from.toLowerCase()})
            // console.log('user', user);
            let swap = await Swap.findOne({wallet: user._id , swapID: data.returnValues.depositId})
            console.log('swap', swap);
            let ethereumTx = await Swap.findByIdAndUpdate(swap._id,
                {
                    txHash: {ethereumTx: data.transactionHash}
                },
                {new: true})

            console.log('ethereumTx: ', ethereumTx);

            if(swap.swapKey.includes('0x')) {
                swap.swapKey = swap.swapKey.slice(2, swap.swapKey.length);
                console.log('swap.swapKey:  ', swap.swapKey);
            }
            console.log('swap id: ', crypto.createHash('sha256').update(swap.swapKey, 'string').digest('hex'));

            try {
                    CallInvoke('MintAndTransfer', {
                        channelName: 'mychannel',
                        chainCodeName: 'bridge',
                        fcn: 'MintAndTransfer',
                        orgName: 'Org1',
                        id: crypto.createHash('sha256').update(swap.swapKey, 'string').digest('hex'),
                        key: swap.swapKey,
                        walletAddress: user.walletAddress,
                        amount: swap.amount,
                        messageHash: swap.messageHash.slice(2, swap.messageHash.length),
                        signature: swap.signature.slice(2, swap.signature.length)
                    })
                    .then((response) => {
                            console.log('CallInvoke -> response', response)
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


        // test
        invokeHandler.MintAndTransfer({
            channelName: 'mychannel',
            chainCodeName: 'bridge',
            fcn: 'MintAndTransfer',
            orgName: 'Org1',
            id: '88af1c375cfc2edd5be4d2c6adf85b8f5019597a124ac121e2387e2227c6cfe7',
            key: 'a80b93ac623311cd732a0b5a8b80e6e5b2bd24905c74532edff57ff0ed7df13e',
            walletAddress: '0x39a98cfe183ba67ac37d4b237ac2bf504314a1e9',
            amount: '0.1',
            messageHash: '0x99fa8155ccd80af12abda5615df638829018bf4283fefd0b7bb1cfe75e347fbb',
            signature: '0xb99a5d30e8ae156af4fa2020ac8a86e79ad6df3177a3b7037e1419f8a17c0fc7710c023ce51c3f7c797a1858f79b5cfbdbfbc18c1f5c16dcfe139b6283228f9c1c'
        })
        .then((response) => {
            console.log('CallInvoke -> response', response)
        }
        ).catch((error) => {
            console.log('1 - CallInvoke -> error', error);
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