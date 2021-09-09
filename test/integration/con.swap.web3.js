const config = require('config');
const Eth = require('../../app/web3/eth.main');
const Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;
const adminConfig = require('./private.json');
let server;

const provider = new Web3.providers.HttpProvider(config.get('ethereum.httpProvider'));
const web3 = new Web3(provider);

const BridgeContractAddress = config.get('ethereum.bridge_contract_address');
const ConContractAddress = config.get('ethereum.contract_address');

const bridgeAbiJson = require('../../app/web3/bridge.swap.abi.json');
const conAbiJson = require('../../app/web3/abi.json');

const conContract = new web3.eth.Contract(conAbiJson, ConContractAddress);
const bridgeContract = new web3.eth.Contract(bridgeAbiJson, BridgeContractAddress);

const initTrustedSigner = async () => {
    web3.eth.defaultAccount = adminConfig.ownerAddress;
    let privateKey = adminConfig.ownerPrivateKey;
    const trustedSigner = await bridgeContract.methods.setTrustedSigner(adminConfig.ownerAddress, true).encodeABI();
    console.log('trustedSigner: ', trustedSigner);

    return  new Promise(
        (resolve, reject) => {
            web3.eth.getTransactionCount(adminConfig.ownerAddress, (err, txCount) => {
                console.log('getTransactionCount Err: ', err);
                // // Build the transaction
                let txObject = {
                    from: adminConfig.ownerAddress,
                    nonce: web3.utils.toHex(txCount),
                    to: BridgeContractAddress,
                    value: '0x0',
                    gasLimit: web3.utils.toHex('2100000'),
                    gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
                    data: trustedSigner
                };
                console.log('>> txObject: ', txObject);


                if(privateKey.includes('0x')) {
                    privateKey = privateKey.slice(2, privateKey.length);
                    console.log('privateKey:  ', privateKey);
                }
              
                const tx = new Tx(txObject, {chain: 'ropsten'});
                tx.sign(Buffer.from(privateKey, 'hex'));

                const serializedTx = tx.serialize();
                console.log('serializedTx: ', serializedTx);
                var raw = '0x' + serializedTx.toString('hex');
                console.log('RAW: ', raw);
                web3.eth.sendSignedTransaction(raw)
                    .on('receipt', function (tx) {
                        console.log('receipt: ', tx.transactionHash);
                        resolve(tx.transactionHash);
                    });
            });
        }
    );

}



const approve = async () => {
    web3.eth.defaultAccount = adminConfig.walletAddress;
    let privateKey = adminConfig.privateKey;

    const _approve = await conContract.methods.approve(BridgeContractAddress, web3.utils.toWei('1')).encodeABI();
    console.log('trustedSigner: ', _approve);

    return  new Promise(
        (resolve, reject) => {
            web3.eth.getTransactionCount(adminConfig.walletAddress, (err, txCount) => {
                console.log('getTransactionCount Err: ', err);
                // // Build the transaction
                let txObject = {
                    from: adminConfig.walletAddress,
                    nonce: web3.utils.toHex(txCount),
                    to: ConContractAddress,
                    value: '0x0',
                    gasLimit: web3.utils.toHex('2100000'),
                    gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
                    data: _approve
                };
                console.log('>> txObject: ', txObject);


                if(privateKey.includes('0x')) {
                    privateKey = privateKey.slice(2, privateKey.length);
                    console.log('privateKey:  ', privateKey);
                }
              
                const tx = new Tx(txObject, {chain: 'ropsten'});
                tx.sign(Buffer.from(privateKey, 'hex'));

                const serializedTx = tx.serialize();
                console.log('serializedTx: ', serializedTx);
                var raw = '0x' + serializedTx.toString('hex');
                console.log('RAW: ', raw);
                web3.eth.sendSignedTransaction(raw)
                    .on('receipt', function (tx) {
                        console.log('receipt: ', tx.transactionHash);
                        resolve(tx.transactionHash);
                    });
            });
        }
    );

}



const depositTokens = async () => {
    web3.eth.defaultAccount = adminConfig.walletAddress;
    let privateKey = adminConfig.privateKey;
    const bridgeContract = new web3.eth.Contract(bridgeAbiJson, BridgeContractAddress);

    let _amount = "1"
    let depositId = "0xbfa24ec298cc0a696f070862394b463c9d34e8fc640bc98ddbee712c378ec630"

    const trustedSigner = await bridgeContract.methods.depositTokens(web3.utils.toWei(_amount), depositId, adminConfig.walletAddress).encodeABI();
    console.log('trustedSigner: ', trustedSigner);

    return  new Promise(
        (resolve, reject) => {
            web3.eth.getTransactionCount(adminConfig.walletAddress, (err, txCount) => {
                console.log('getTransactionCount Err: ', err);
                // // Build the transaction
                let txObject = {
                    from: adminConfig.walletAddress,
                    nonce: web3.utils.toHex(txCount),
                    to: BridgeContractAddress,
                    value: '0x0',
                    gasLimit: web3.utils.toHex('2100000'),
                    gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
                    data: trustedSigner
                };
                console.log('>> txObject: ', txObject);


                if(privateKey.includes('0x')) {
                    privateKey = privateKey.slice(2, privateKey.length);
                    console.log('privateKey:  ', privateKey);
                }
              
                const tx = new Tx(txObject, {chain: 'ropsten'});
                tx.sign(Buffer.from(privateKey, 'hex'));

                const serializedTx = tx.serialize();
                console.log('serializedTx: ', serializedTx);
                var raw = '0x' + serializedTx.toString('hex');
                console.log('RAW: ', raw);
                web3.eth.sendSignedTransaction(raw)
                    .on('receipt', function (tx) {
                        console.log('receipt: ', tx.transactionHash);
                        resolve(tx.transactionHash);
                    });
            });
        }
    );

}


// initTrustedSigner();

// approve();
// depositTokens();