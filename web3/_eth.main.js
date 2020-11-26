#!/usr/bin/env node
const events = require('events');
var web3Event = new events.EventEmitter();

const {config} = require('../private/project.settings');

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xmlHttp = new XMLHttpRequest();
var Tx = require('ethereumjs-tx').Transaction;

const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(config().ethereum.httpProvider);
//test const provider = new Web3.providers.HttpProvider('https://ropsten-rpc.linkpool.io/');
const web3 = new Web3(provider);

var abijson = require('./abi.json');
var abiarray = abijson;

var jsonload = require("./api.json");
var apijson = JSON.stringify(jsonload);
const fs = require('fs');
apiurl = JSON.parse(apijson);

function privateToAccount(privateKey)
{
    try {
    if(!privateKey.includes('0x')) privateKey = '0x' + privateKey;
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
        return {
            wallet_address: account.address,
            privateKey: privateKey
        }
    }   catch (e) {
        return {
            wallet_address: null,
            error: 'Error: while private key import, please check your private key'
        }
    }
}

function CreateAccount( password )
{
    var cw = web3.eth.accounts.create( password );
    return [cw.address, cw.privateKey];
}

function CreateAccountAdvanced( password )
{
    [address, privateKey] = CreateAccount();
    let getKeystore = web3.eth.accounts.encrypt(privateKey, password);
    let stringKeystore = JSON.stringify(getKeystore);
    return [ address, privateKey, password,  stringKeystore];
}

function keyStoreDecrypt(jsonKeystore, password)
{
    try {
        let data = web3.eth.accounts.decrypt(jsonKeystore, password)
        return {
            wallet_address: data.address,
            privateKey: data.privateKey,
            password: password,
            stringKeystore: jsonKeystore
        };
    }   catch (e) {
        return {
            wallet_address: null,
            error: 'Error: Key derivation failed - possibly wrong password'
        }
    }
}

async function getBalanceOfCon(from,contract_address) {
    //const web3 = new Web3(process.env.GETH_IPC);
    const contract = new web3.eth.Contract(abiarray, contract_address);

    await contract.methods.balanceOf(from).call()
        .then(res => {
            var Token = web3.utils.fromWei(res);
            console.log(Token  + " CON");
        });
}

async function getBalanceOfEth(address) {
    //var privatekey = "0xA90AE506319845E4B2BA10B8DB99DD607A303109FE0D85DE9D17FFD80F97ED6C";
    // const address = privateToAccount( privateKey ); // Your account address goes here
    await web3.eth.getBalance(address, (err, wei) => {
        if (err) {
            console.log(err)
        } else {
            console.log(web3.utils.fromWei(wei, "ether"));
            return web3.utils.fromWei(wei, "ether");
        }
    })
}

async function getGasPrice(to_address) {
    const account = '0x7Cb62c64d97070f654f5f6899D00AF10842fBcB7';
    web3.eth.defaultAccount = account;
    var sender = web3.eth.accounts[0];
    var receiver = to_address;
    var balance = web3.eth.getBalance(sender);
    var gasPrice = web3.eth.getGasPrice(); // estimate the gas price

    const transactionObject = {
        from: sender,
        to: receiver,
        gasPrice: gasPrice,
    }

    var gasLimit = web3.eth.estimateGas(transactionObject); // estimate the gas limit for this transaction
    var transactionFee = gasPrice * gasLimit; // calculate the transaction fee

    transactionObject.gas = gasLimit;
    transactionObject.value = balance - transactionFee; // set the transaction value to the entire balance, less the transaction fee

    return web3.eth.sendTransaction(transactionObject, myCallbackFunction);
}


//https://ethereum.stackexchange.com/questions/70832/signing-transactions-with-web3-js
async function SendETH(object) {
    if(object.type === 'default') {
        // console.log('estimateGas: ', setEstimateGas);
        object.gasLimit = await web3.eth.estimateGas({
            from: object.from_address,
            to: object.to_address
        });
        console.log('estimateGas: ', object.gasLimit);

        await web3.eth.getGasPrice().then((result) => {
            object.gasPrice = web3.utils.fromWei(result, 'gwei');
            console.log('getGasPrice: ', object.gasPrice)
        });

    }


    return  new Promise(
        (resolve, reject) => {
            web3.eth.defaultAccount = object.from_address;

            if(object.private_key.includes('0x')) {
                object.private_key = object.private_key.slice(2, object.private_key.length);
                console.log('>> ', object.private_key);
            }

            object.private_key = Buffer.from(object.private_key, 'hex');


            console.log('Get SendETH: ', object);
            web3.eth.getTransactionCount(object.from_address, (err, txCount) => {
                // // Build the transaction
                const txObject = {
                    nonce: web3.utils.toHex(txCount),
                    to: object.to_address,
                    value: web3.utils.toHex(web3.utils.toWei(object.value)),
                    gasLimit: web3.utils.toHex(object.gasLimit),
                    gasPrice: web3.utils.toHex(web3.utils.toWei(object.gasPrice, 'gwei')),
                    // data: myData
                };
                console.log('txObject: ', txObject);
                // Sign the transaction
                const tx = new Tx(txObject, {chain: 'ropsten'});
                tx.sign(object.private_key);

                const serializedTx = tx.serialize();
                const raw = '0x' + serializedTx.toString('hex');
                console.log('RAW: ', raw);

                // Broadcast the transaction
                web3.eth.sendSignedTransaction(raw, (err, tx) => {
                    console.log('Transaction: ', tx, err);
                    if(tx)resolve(tx);
                    else reject(err);
                });

            })
        }
    );
}

async function SendCON(object) {
    try {
        object.contract_address = config().ethereum.contract_address;
        web3.eth.defaultAccount = object.from_address;

        if(object.private_key.includes('0x')) {
            object.private_key = object.private_key.slice(2, object.private_key.length);
            console.log('>> ', object.private_key);
        }

        object.private_key = Buffer.from(object.private_key, 'hex');


        console.log('Get SendCON: ', object);

        var myContract = new web3.eth.Contract(abiarray, object.contract_address, {
            from: object.from_address
        });

        var myData = myContract.methods.transfer(object.to_address, web3.utils.toWei(object.value)).encodeABI();

        if(object.type === 'default') {
            object.gasLimit = await EstimateGas(
                web3.eth.defaultAccount, //from
                object.to_address,                     //to
                object.contract_address,        //contract
                object.value);           //token

            console.log('setEstimateGas CON: ', object.gasLimit);

            await web3.eth.getGasPrice().then((result) => {
                // let gasPrice = web3.utils.fromWei(result, 'gwei');
                // object.gasPrice = web3.utils.toWei(gasPrice, 'ether');
                object.gasPrice = result;
                console.log('getGasPrice CON: ', object.gasPrice, result);
            });

        }

        return  new Promise(
            (resolve, reject) => {
                web3.eth.getTransactionCount(object.from_address, (err, txCount) => {
                    // // Build the transaction
                    var txObject = {
                        from: object.from_address,
                        nonce: web3.utils.toHex(txCount),
                        to: object.contract_address,
                        value: '0x0',
                        gasLimit: web3.utils.toHex( object.gasLimit),
                        gasPrice: web3.utils.toHex(object.gasPrice),
                        // gasLimit: "0x7458",
                        // gasPrice: "0x04e3b29200",
                        data: myData
                    };
                    console.log('txObject: ', txObject);
                    // Sign the transaction
                    const tx = new Tx(txObject, {chain: 'ropsten'});
                    tx.sign(object.private_key);

                    const serializedTx = tx.serialize();
                    console.log('serializedTx: ', serializedTx);
                    var raw = '0x' + serializedTx.toString('hex');
                    console.log('RAW: ', raw);
                    web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                        .on('receipt', function (tx) {
                            console.log('receipt: ', tx.transactionHash);
                            if(tx)resolve(tx.transactionHash);
                            else reject();
                        });
                });
            }
        );
    }catch (e) {
        console.log('>> Con transaction err: ',e)
    }

}


async function getTransactionFee(object) {
    var data = {
        gasLimit: null,
        gasPrice: null
    };

    data.gasLimit = await web3.eth.estimateGas({
        from: object.from_address,
        to: object.to_address
    });
    console.log('estimateGas: ', data.gasLimit);

    await web3.eth.getGasPrice().then((result) => {
        data.gasPrice = web3.utils.fromWei(result, 'gwei');
        console.log('getGasPrice: ', typeof data.gasPrice)
    });

    return {
        CMD: 'RES_ESTIMATE_NETWORK_FEE',
        slow: {
            gas_price: String(data.gasPrice),
            gas_limit: data.gasLimit,
            total: (data.gasPrice * data.gasLimit) / 1000000000
        },
        average: {
            gas_price: String(2 * data.gasPrice),
            gas_limit: data.gasLimit,
            total: ((data.gasPrice * 2) * data.gasLimit) / 1000000000
        },
        fast: {
            gas_price: String(3 * data.gasPrice),
            gas_limit: data.gasLimit,
            total: ((data.gasPrice * 3) * data.gasLimit) / 1000000000
        }
    }
}

async function GetTxReceipt(object) {
    const transaction = await web3.eth.getTransaction(object);

    return new Promise(
        (resolve, reject) => {
            console.log('tx ->: ', transaction);
            if(transaction.transactionIndex !== null && transaction.blockHash !== null) {
                var receipt =  web3.eth.getTransactionReceipt(object);
                console.log('receipt tx: ', receipt)
                resolve(receipt)
            } else {
                console.log(' error -> receipt tx');
                reject(transaction)
            }
        });
}

//=====================================================================================


async function getBalanceCon(from, contract_address)
{
    let contract = web3.eth.Contract(abiarray, contract_address);
    contract.methods.balanceOf(from).call((error, balance) => {
        contract.methods.decimals().call((error, decimals) => {
            balance = balance.div(10 ** decimals);
            console.log(balance.toString());
        });
    });
}



/* 가스스테이션 정보 가져올때 사용 */
function CallbackGasStation(responseText)
{
    console.log(responseText);
}
function CallbackRealTimePrice(responseText)
{
    console.log(responseText);
}
function httpGetAsync(theUrl, callback)
{
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

function httpGet(theUrl)
{
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

const ETH_Send = async (to,tokenAmount) => {
    // This code was written and tested using web3 version 1.0.0-beta.26

    const account1 = '0x14eaFC87cB40243327628cfEeD0CF33e1ecccF5a'; // Your account address 1
    //const account2 = '' // Your account address 2
    web3.eth.defaultAccount = account1;

    const privateKey1 = Buffer.from('a90ae506319845e4b2ba10b8db99dd607a303109fe0d85de9d17ffd80f97ed6c', 'hex');

    const abi = [{"constant":false,"inputs":[{"name":"_greeting","type":"string"}],"name":"greet","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getGreeting","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];

    const contract_Address = "0xd891a2a0aeba00e39db111288a1b7d6160fe649d";

    //const myContract = new web3.eth.Contract(abiarray, contract_Address);
    var	myContract = new web3.eth.Contract(abi,contract_Address,{
        from: account1
    });

    //const myData = myContract.methods.transfer(to,web3.utils.toWei(tokenAmount)).encodeABI();
    //console.log(myData);

    const myData = myContract.methods.greet( "hello blockchain devs").encodeABI();

    web3.eth.getTransactionCount(account1, (err, txCount) => {
        // // Build the transaction
        const txObject = {
            nonce:    web3.utils.toHex(txCount),
            to:       to,
            value:    web3.utils.toHex(web3.utils.toWei(tokenAmount)),
            gasLimit: web3.utils.toHex(2100000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('2', 'gwei')),
            data: myData
        }
        // Sign the transaction
        const tx = new Tx(txObject,{chain:'ropsten'});
        tx.sign(privateKey1);

        const serializedTx = tx.serialize();
        const raw = '0x' + serializedTx.toString('hex');

        // Broadcast the transaction
        const transaction = web3.eth.sendSignedTransaction(raw, (err, tx) => {
            console.log(tx)
        });
    });

}



/**
 * @return {number}
 */
async function EstimateGas(_from,_to, _contract_address, _tokenamount)
{
    var	myContract = new web3.eth.Contract(abiarray,_contract_address,{
        from: _from
    });

    const myData = myContract.methods.transfer(_to, web3.utils.toWei(_tokenamount)).encodeABI();

    var getEstimateGas = await web3.eth.estimateGas({
        from     : _from,
        to       : _contract_address,
        data     : myData
    });

    return getEstimateGas;
}


function HttpGetCurrentPrice(url)
{
    var CurrentPrice = 0;
    var TransactionHistory = JSON.parse(httpGet(url));
    CurrentPrice = TransactionHistory["data"][19]["price"];
    return CurrentPrice;
}
function HttpGetKrwToUsd(url, erc20_price)
{
    var ToUsd = 0;
    var krwToUsdExchangeRate = JSON.parse(httpGet(url));
    ToUsd = erc20_price * krwToUsdExchangeRate["KRWUSD"][6];
    return ToUsd;
}

function ConToEth(Con)
{
    var ConCount;
    var EthCount;

    EthPrice = HttpGetCurrentPrice(apiurl["EthPrice"]);
    ConPrice = HttpGetCurrentPrice(apiurl["ConPrice"]);

    ConCount = ConPrice * Con;
    EthCount = ConCount / EthPrice;

    return EthCount;
}

function EthToCon(Eth)
{
    var ConCount;
    var EthCount;

    EthPrice = HttpGetCurrentPrice(apiurl["EthPrice"]);
    ConPrice = HttpGetCurrentPrice(apiurl["ConPrice"]);

    EthCount = EthPrice * Eth;
    ConCount = EthCount / ConPrice;

    return ConCount;
}

function ConToKrw(Con)
{
    var ConPrice;
    var ConToKrw;

    ConPrice = HttpGetCurrentPrice(apiurl["ConPrice"]);
    ConToKrw = ConPrice * Con;

    return ConToKrw;
}

function EthToKrw(Eth)
{
    var EthPrice;
    var EthToKrw;

    EthPrice = HttpGetCurrentPrice(apiurl["EthPrice"]);
    EthToKrw = EthPrice * Eth;

    return EthToKrw;
}

function KrwToEth(Krw)
{
    var EthPrice;
    var KrwToEth;

    EthPrice = HttpGetCurrentPrice(apiurl["EthPrice"]);
    KrwToEth = Krw / EthPrice;

    return KrwToEth;
}

function KrwToCon(Krw)
{
    var ConPrice;
    var KrwToCon;

    ConPrice = HttpGetCurrentPrice(apiurl["ConPrice"]);
    KrwToCon = Krw / ConPrice;

    return KrwToCon;
}



function KrwToExchange()
{
    console.log(EthToKrw(2));
    console.log(KrwToEth(EthToKrw(2)));
}
function ExchangeRateTest()
{
    var Con = EthToCon(1);

    console.log(Con);

    var Ethe = ConToEth(Con);

    console.log(Ethe);
}
function BalanceofTest()
{
    getBalanceOfCon('0x14eaFC87cB40243327628cfEeD0CF33e1ecccF5a','0xd891a2a0aeba00e39db111288a1b7d6160fe649d');  //컨트랜트
    getBalanceOfEth('0xA90AE506319845E4B2BA10B8DB99DD607A303109FE0D85DE9D17FFD80F97ED6C'); //이더리움
}

function SendTest()
{
    // ETH_Send('0xE444D6FD11D6420cA008d2c4Af8d4767104B2658','0.5');
    // CON_Send('0xE444D6FD11D6420cA008d2c4Af8d4767104B2658','1.0');
}

function PrivateAccountTest()
{
    var address = privateToAccount("23c8dd25b1fd2c5157376d73e56f267d6362c197785c1cb7eb575910960cb563");
    console.log(address);
}

/**
 * @return {number}
 */
function Ceverted_Erc20ToExchangeRate(
    transaction_historyUrl,
    KrwToUsd_ExchangeRateUrl)
{
    const Erc20Price = HttpGetCurrentPrice(transaction_historyUrl);
    return HttpGetKrwToUsd(KrwToUsd_ExchangeRateUrl, Number(Erc20Price));
}


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

web3Event.on('req-web3-event', function (m) {
    try {
        switch (m.type) {
            case 'REQ_CREATE_ACCOUNT':
                [ wallet_address, privateKey, password,  stringKeystore] = CreateAccountAdvanced(m.payload);
                var data = {
                    wallet_address: wallet_address,
                    privateKey: privateKey,
                    password: password,
                    stringKeystore: stringKeystore
                };
                response = {CMD: 'RES_CREATE_ACCOUNT', data};
                console.log('RES_CREATE_ACCOUNT: ', response)
                web3Event.emit('res-web3-event', response);
                break;


            case 'REQ_IMPORT_PRIVATE_KEY':
                var data = privateToAccount(m.payload.privateKey);
                var response = {    CMD: 'IMPORT_PRIVATE_KEY_RES', data   };
                web3Event.emit('res-web3-event', response);
                break;


            case 'REQ_IMPORT_JSON_KEYSTORE':
                var activated = keyStoreDecrypt(m.payload.json_keystore, m.payload.password_import);
                var response = { CMD: 'IMPORT_JSON_KEYSTORE_RES', data: activated };
                web3Event.emit('res-web3-event', response);
                break;


            case 'REQ_IMPORT_NEW_JSON_KEYSTORE':
                var activated = keyStoreDecrypt(m.payload.json_keystore, m.payload.password_import);
                var response = {CMD: 'IMPORT_NEW_JSON_KEYSTORE_RES', data: activated};
                web3Event.emit('res-web3-event', response);
                break;


            case 'REQ_CHECK_BALANCE_OF':
                //console.log('eth.main-> CHECK_BALANCE_OF_ETH: ', m.payload);
                var get_balance = {
                    coin_eth : null,
                    coin_con: null
                };
                console.log('CHECK_BALANCE_OF prom:', m.payload);
                const makeBalanceOfEthPromise = new Promise(
                    function (resolve, reject) {
                        web3.eth.getBalance(m.payload, (err, wei) => {
                            if (err) {
                                console.log(err);
                                reject(err)
                            }
                            else if(wei) {
                                let balance = web3.utils.fromWei(wei, "ether");
                                console.log('CHECK_BALANCE_OF_ETH: ', balance);
                                // resolve(balance);
                                get_balance.coin_eth = balance;
                                if (get_balance.coin_con !== null)
                                    resolve(get_balance)
                            }
                        });
                        const contract = new web3.eth.Contract(abiarray, config().ethereum.contract_address);
                        contract.methods.balanceOf(m.payload).call()
                            .then(res => {
                                var token = web3.utils.fromWei(res);
                                console.log('CHECK_BALANCE_OF_CON: ', token);
                                get_balance.coin_con = token;
                                if(get_balance.coin_eth !== null)
                                resolve(get_balance)
                            });
                    }
                );
                makeBalanceOfEthPromise.then(data => {
                    console.log('makeBalancePromise: ', data);
                    var response = {CMD: 'RES_CHECK_BALANCE_OF', data};
                    web3Event.emit('res-web3-event', response);
                }).catch(function (error) {
                    console.log(error);
                    var response = { CMD: 'RES_CHECK_BALANCE_OF', data: error };
                    web3Event.emit('res-web3-event', response);
                });
                break;


            case 'REQ_SEND_ETH_TRANSACTION':
                console.log('SEND_ETH_TRANSACTION: ', m.payload);
                SendETH(m.payload).then(function (data) {
                    console.log('Get Promise', data);
                    var response = {CMD: 'RES_SEND_ETH_TRANSACTION', data};
                    web3Event.emit('res-web3-event', response);
                }).catch(function (error) {
                    console.log('Fail Transaction Promise', error);
                    var response = {CMD: 'RES_SEND_ETH_TRANSACTION', data: 'FAIL WHILE TRANSACTION'};
                    web3Event.emit('res-web3-event', response);
                });
                break;


            case 'REQ_SEND_CON_TRANSACTION':
                console.log('SEND_CON_TRANSACTION: ', m.payload);
                SendCON(m.payload).then(function (data) {
                    console.log('Get Promise', data);
                    var response = {CMD: 'RES_SEND_CON_TRANSACTION', data};
                    web3Event.emit('res-web3-event', response);
                }).catch(function (error) {
                    console.log('Fail Transaction Promise', error)
                });
                break;


            case 'REQ_ESTIMATE_NETWORK_FEE':
                console.log('ESTIMATE_NETWORK_FEE: ', m.payload);
                getTransactionFee(m.payload).then(function (data) {
                    console.log('Get Promise', data);
                    web3Event.emit('res-web3-event', data);
                }).catch(function (error) {
                    console.log('Fail Transaction Promise', error)
                });
                break;


            case 'REQ_GET_TX_RECEIPT':
                console.log('ESTIMATE_NETWORK_FEE: ', m.payload);
                GetTxReceipt(m.payload).then(function (data) {
                    console.log('Get Promise', data);
                    var response = {CMD: 'RES_TX_RECEIPT', data};
                    web3Event.emit('res-web3-event', response);
                }).catch(function (error) {
                    console.log('Fail Transaction Receipt', error);
                    var response = {CMD: 'RES_TX_RECEIPT', error};
                    web3Event.emit('res-web3-event', response);
                });
                break;




            default:
                throw new Error('Unrecognized message received by web3 cmd');
        }
    } catch (e) {
        console.log(e); // eslint-disable-line no-console
    }
});

module.exports = web3Event;