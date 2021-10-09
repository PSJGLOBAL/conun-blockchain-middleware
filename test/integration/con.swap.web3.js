const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Eth = require('../../app/web3/eth.main');
const Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;
const adminConfig = require('./private.json');
let server;

const provider = new Web3.providers.HttpProvider(process.env.ETHER_HTTP_PROVIDER);
// todo make event listener
// todo get abi from url
const wsProvider = new Web3.providers.WebsocketProvider(process.env.ETHER_WS_PROVIDER);
const web3 = new Web3(wsProvider);

// const wsweb3 = new Web3(wsProvider);

const BridgeContractAddress = process.env.ETHER_BRIDGE_CONTRACT_ADDRESS;
const ConContractAddress = process.env.ETHER_CON_CONTRACT_ADDRESS;

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

    const _approve = await conContract.methods.approve(BridgeContractAddress, web3.utils.toWei('10')).encodeABI();
    console.log('_approve: ', _approve);

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
    let swapID = "0xbfa24ec298cc0a696f070862394b463c9d34e8fc640bc98ddbee712c378ec630"

    const deposit = await bridgeContract.methods.depositTokens(web3.utils.toWei(_amount), swapID, adminConfig.walletAddress).encodeABI();
    console.log('deposit: ', deposit);

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
                    data: deposit
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


const claimTokens = async () => {
    web3.eth.defaultAccount = adminConfig.walletAddress;
    let privateKey = adminConfig.privateKey;
    const bridgeContract = new web3.eth.Contract(bridgeAbiJson, BridgeContractAddress);

    let _amount = web3.utils.toWei("1")
    console.log('_amount: ', _amount);
    
    let seed = web3.eth.abi.encodeParameters(['string', 'address'], [uuidv4(), adminConfig.walletAddress])
    let _key = web3.utils.sha3(seed, {encoding: 'hex'});
    // let __key = 'b4cee65fed39d76aefdc7df265aafa0b15e99083b5bfbc40cf03816498c458f4';
    let swapID = crypto.createHash('sha256').update(_key.slice(2, _key.length), 'hex').digest('hex');
    if (!swapID.includes('0x')) swapID = '0x' + swapID;
    console.log('\r\n');
    console.log('seed: ', seed);
    console.log('_key:', _key, web3.utils.isHex(_key));
    console.log('swapID: ', swapID, web3.utils.isHex(swapID))


    // let swapID = "0xa18b582d8d172daf74b8f98a1f6a467126506b92fc4dd72517048169d2000d43"   // id
    // let _key = "0xd7d5e2fa9149c2267b474e4f2432fc4746d042a632b20dbc0c0c65e7699ebb1a" // key


    const encoded = web3.eth.abi.encodeParameters(['uint256', 'address'], [_amount, adminConfig.walletAddress])
    console.log('encoded: ', encoded);
    const hash = web3.utils.sha3(encoded, {encoding: 'hex'})
    console.log('hash: ', hash);
    let hashed = await Eth.CreateSignature(hash, adminConfig.ownerPrivateKey)
    console.log("hashed: ", hashed);
    let _msgForSign = hashed.messageHash
    let _signature = hashed.signature
    

    const withdrawal = await bridgeContract.methods.claimTokens(_amount, swapID, _msgForSign, _signature, _key).encodeABI();
    console.log('withdrawal: ', withdrawal);

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
                    gasLimit: web3.utils.toHex('144159'),
                    gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
                    data: withdrawal
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
depositTokens();
// claimTokens();

(()=> {
    console.log('>>')
    bridgeContract.events.allEvents()
    .on('connected', (id) => {
        console.log('listenContractEvent connected', id); 
    })
    .on('data', (event) => {
        console.log('listenContractEvent', event);
    })
    .on('error', (err) => {
        console.log('listenContractEvent err: ', err)
    });
    console.log('<<')
})()