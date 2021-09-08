const config = require('config');
const Eth = require('../../app/web3/eth.main');
const Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;
const adminConfig = require('./private.json');
let server;

const provider = new Web3.providers.HttpProvider(config.get('ethereum.httpProvider'));

const web3 = new Web3(provider);
const BridgeContractAddress = config.get('ethereum.bridge_contract_address');
const bridgeAbiJson = require('../../app/web3/bridge.swap.abi.json');
const bridgeContract = new web3.eth.Contract(bridgeAbiJson, BridgeContractAddress, {
    from: adminConfig.ownerAddress
});
let privateKey = adminConfig.ownerPrivateKey;

const initTrustedSigner = async () => {
    web3.eth.defaultAccount = adminConfig.ownerAddress;
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
                    // gasLimit: "0x7458",
                    // gasPrice: "0x04e3b29200",
                    data: trustedSigner
                };
                console.log('>> txObject: ', txObject);


                if(privateKey.includes('0x')) {
                    privateKey = privateKey.slice(2, privateKey.length);
                    console.log('privateKey:  ', privateKey);
                }
                // privateKey = Buffer.from(privateKey, 'hex');
                // Sign the transaction
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

initTrustedSigner();