const Web3 = require('web3');

class EtherEvent {
    constructor(contractAddress, abi, url) {
        this.contractAddress = contractAddress;
        this.abi = abi;
        this.url = url;
        this.provider = new Web3.providers.WebsocketProvider(this.url);
        this.web3 = new Web3(this.provider);
        this.listenContract = new this.web3.eth.Contract(this.abi, this.contractAddress);
    }

    listenEvent() {
        this.listenContract.events.allEvents()
        .on('connected', (id) => {
            console.log('listenContractEvent connected', id); 
        })
        .on('data', (event) => {
            console.log('listenContractEvent', event);
            process.send(event);
        })
        .on('error', (err) => {
            console.log('listenContractEvent err: ', err)
            process.send(err);
        });
    }
}

exports.EtherEvent = EtherEvent;