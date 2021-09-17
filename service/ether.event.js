const Web3 = require('web3');
const config = require('config');
const crypto = require('crypto');
const CallInvoke = require('./helper/swap.conx');
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
    }
}






let BridgeContractAddress = config.get('ethereum.bridge_contract_address');
let bridgeAbiJson = require('../app/web3/bridge.swap.abi.json');
let url = config.get('ethereum.wsProvider');

const etherEvent = new EtherEvent(BridgeContractAddress, bridgeAbiJson, url);
etherEvent.listenEvent();


// let _key = "0x70739850a5953fbd67d6c833a6c1ac981f63d5526b0ccc31b43f566f750f0837"
// console.log('ID>> ', crypto.createHash('sha256').update(_key.slice(2, _key.length), 'string').digest('hex'))

// CallInvoke('MintAndTransfer', {
//     channelName: 'mychannel',
//     chainCodeName: 'bridge',
//     fcn: 'MintAndTransfer',
//     orgName: 'Org1',
//     id: 'cafc111767151332f3cf15bd47ccaa4937b411c5150acda91d4fe563c402243a',
//     key: '70739850a5953fbd67d6c833a6c1ac981f63d5526b0ccc31b43f566f750f0837',
//     walletAddress: '0x39a98cfe183ba67ac37d4b237ac2bf504314a1e9',
//     amount: '1',
//     messageHash: 'e65173d782cfef623c409eeb465bb2db2d60fb717bf385017e17acd154d95bfa',
//     signature: 'e65149a4205852dbd13e3fd3db69cd51b904e6c1e7ba9b40104ce1c850f8cbef39e8fb617b2c1bfbb99f7e600b7b0e7eb5eba1917d9f089e68aea672e09a7db81c'
// })
// .then((response) => {
//     console.log('CallInvoke -> response', response)
// }
// ).catch((error) => {
//     console.log('1 - CallInvoke -> error', error);
// });


// etherEvent.querySwapID();

// (async() => {
//     let swap = await Swap.findOne({swapID: '0x65f530a5f270fbd5dae8882753afa3e6032445b8ff63f10b2faf499cffeec30c'});
// console.log('swap: ', swap);
// })();