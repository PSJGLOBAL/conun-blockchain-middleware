#!/usr/bin/env node
const config = require('config');

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xmlHttp = new XMLHttpRequest();
var Tx = require('ethereumjs-tx').Transaction;

const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(config.get('ethereum.httpProvider'));
const ConContractAddress = config.get('ethereum.contract_address');
const web3 = new Web3(provider);

var abijson = require('./abi.json');
var abiarray = abijson;

var jsonload = require("./api.json");
var apijson = JSON.stringify(jsonload);
const fs = require('fs');
apiurl = JSON.parse(apijson);

//https://ethereum.stackexchange.com/questions/70832/signing-transactions-with-web3-js

module.exports = {
    privateToAccount : async (privateKey) => {
        return new Promise(
            (resolve, reject) => {
                if (!privateKey.includes('0x')) privateKey = '0x' + privateKey;
                let account = web3.eth.accounts.privateKeyToAccount(privateKey);
                if(account) {
                    resolve({
                        wallet_address: account.address,
                        privateKey: privateKey
                    })
                }
                else {
                    reject({
                        wallet_address: null,
                        error: 'Error: while private key import, please check your private key'
                    })
                }
            }
        )
    },

    CreateAccount : (password) => {
        return new Promise(
            (resolve, reject) => {
                const cw = web3.eth.accounts.create(password);
                if(cw) {
                    resolve({
                        walletAddress: cw.address,
                        privateKey: cw.privateKey
                    })
                }
                else {
                    reject(cw)
                }
            }
        )
    },

    CreateAccountAdvanced : async ( password ) => {
        const cw = web3.eth.accounts.create(password);
        console.log('cw: ', cw)
        return new Promise(
            (resolve, reject) => {
                let getKeystore = web3.eth.accounts.encrypt(cw.privateKey, password);
                if (getKeystore) {
                    let data = {
                        walletAddress: cw.address,
                        privateKey: cw.privateKey,
                        password: password,
                        stringKeystore: getKeystore
                    }
                    resolve(data)
                } else {
                    reject(getKeystore)
                }
            }
        )
    },

    ImportAccountByPrivateKey : async ( privateKey, password ) => {
        return new Promise(
            (resolve, reject) => {
                let getKeystore = web3.eth.accounts.encrypt(privateKey, password);
                let account = web3.eth.accounts.privateKeyToAccount(privateKey);
                console.log('address: ', account)
                if (getKeystore) {
                    let data = {
                        walletAddress: account.address,
                        privateKey: privateKey,
                        password: password,
                        stringKeystore: getKeystore
                    }
                    resolve(data)
                } else {
                    reject(getKeystore)
                }
            }
        )
    },

    keyStoreDecrypt : async (jsonKeystore, password) => {
        return new Promise(
            (resolve, reject) => {
                let data = web3.eth.accounts.decrypt(jsonKeystore, password)
                if(data) {
                    resolve({
                        wallet_address: data.address,
                        privateKey: data.privateKey,
                        password: password,
                        jsonKeystore: jsonKeystore
                    })
                }
                else {
                    reject({
                        wallet_address: null,
                        error: 'Error: Key derivation failed - possibly wrong password'
                    })
                }
            }
        )
    },

    getBalanceOfCon : async (from) => {
        return new Promise (
            (resolve, reject) => {
                const contract = new web3.eth.Contract(abiarray, ConContractAddress);
                contract.methods.balanceOf(from).call()
                    .then(res => {
                        resolve(web3.utils.fromWei(res))
                    }).catch(error => {
                    reject(error)
                });
            }
        )
    },

    getBalanceOfEth : async (address) => {
        return new Promise (
                (resolve, reject) => {
                    web3.eth.getBalance(address, (err, wei) => {
                        resolve(web3.utils.fromWei(wei, "ether"));
                        if(err) reject(err);
                    })
                }
            )
    },

    getTransactionFee: async (object) => {
        let data = {
            gasLimit: null,
            gasPrice: null
        };

        data.gasLimit = await web3.eth.estimateGas({
            from: object.fromAddress,
            to: object.toAddress
        });
        console.log('estimateGas: ', data.gasLimit);

        await web3.eth.getGasPrice().then((result) => {
            data.gasPrice = web3.utils.fromWei(result, 'gwei');
            console.log('getGasPrice: ', typeof data.gasPrice)
        });

        return {
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
    },

    TokenEstimateGasFee: async (object)  =>
    {
        let data = {
            gasLimit: null,
            gasPrice: null
        };

        var	myContract = new web3.eth.Contract(abiarray,ConContractAddress,{
            from: object.fromAddress
        });
        console.log('?>?')
        const myData = myContract.methods.transfer(object.toAddress, web3.utils.toWei(object.value)).encodeABI();

        console.log("myData: ", myData)

        data.gasLimit = await web3.eth.estimateGas({
            from     : object.fromAddress,
            to       : ConContractAddress,
            data     : myData
        });

        await web3.eth.getGasPrice().then((result) => {
            data.gasPrice = web3.utils.fromWei(result, 'gwei');
            console.log('getGasPrice: ', typeof data.gasPrice)
        });

        return {
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
    },

    SendETH: async (object) => {
        console.log('Send ETH', object);
        // if(object.type === 'default') {
        //     // console.log('estimateGas: ', setEstimateGas);
        //     object.gasLimit = await web3.eth.estimateGas({
        //         from: object.fromAddress,
        //         to: object.toAddress
        //     });
        //     console.log('estimateGas: ', object.gasLimit);
        //
        //     await web3.eth.getGasPrice().then((result) => {
        //         object.gasPrice = web3.utils.fromWei(result, 'gwei');
        //         console.log('getGasPrice: ', object.gasPrice)
        //     });
        // }
        return  new Promise(
            (resolve, reject) => {
                web3.eth.defaultAccount = object.fromAddress;

                if(object.privateKey.includes('0x')) {
                    object.privateKey = object.privateKey.slice(2, object.privateKey.length);
                    console.log('>> ', object.privateKey);
                }

                object.privateKey = Buffer.from(object.privateKey, 'hex');


                console.log('Get SendETH: ', object);
                web3.eth.getTransactionCount(object.fromAddress, (err, txCount) => {
                    // // Build the transaction
                    const txObject = {
                        nonce: web3.utils.toHex(txCount),
                        to: object.toAddress,
                        value: web3.utils.toHex(web3.utils.toWei(object.value)),
                        gasLimit: web3.utils.toHex(object.gasLimit),
                        gasPrice: web3.utils.toHex(web3.utils.toWei(object.gasPrice, 'gwei')),
                        // data: myData
                    };
                    console.log('txObject: ', txObject);
                    // Sign the transaction
                    const tx = new Tx(txObject, {chain: 'ropsten'});
                    tx.sign(object.privateKey);

                    const serializedTx = tx.serialize();
                    const raw = '0x' + serializedTx.toString('hex');
                    console.log('RAW: ', raw);

                    // Broadcast the transaction
                    // web3.eth.sendSignedTransaction(raw)
                    //     // .on('transactionHash', function(hash){
                    //     //     console.log('1 transactionHash: ', hash)
                    //     //     resolve(hash);
                    //     // })
                    //     .on('receipt', function (tx) {
                    //         if(tx)resolve(tx.transactionHash);
                    //         else reject();
                    //     });

                    web3.eth.sendSignedTransaction(raw, (error, hash) => {
                        if(error) reject(false);
                        resolve(hash);
                    })

                })
            }
        );
    },

    SendCON: async (object) => {
        try {
            object.contract_address = config.get('ethereum.contract_address');
            web3.eth.defaultAccount = object.fromAddress;

            if(object.privateKey.includes('0x')) {
                object.privateKey = object.privateKey.slice(2, object.privateKey.length);
                console.log('>> ', object.privateKey);
            }

            object.privateKey = Buffer.from(object.privateKey, 'hex');


            console.log('Get SendCON: ', object);

            var myContract = new web3.eth.Contract(abiarray, object.contract_address, {
                from: object.fromAddress
            });

            var myData = myContract.methods.transfer(object.toAddress, web3.utils.toWei(object.value)).encodeABI();


            return  new Promise(
                (resolve, reject) => {
                    web3.eth.getTransactionCount(object.fromAddress, (err, txCount) => {
                        // // Build the transaction
                        var txObject = {
                            from: object.fromAddress,
                            nonce: web3.utils.toHex(txCount),
                            to: object.contract_address,
                            value: '0x0',
                            // gasLimit: web3.utils.toHex( object.gasLimit),
                            // gasPrice: web3.utils.toHex(object.gasPrice),
                            gasLimit: web3.utils.toHex(object.gasLimit),
                            gasPrice: web3.utils.toHex(web3.utils.toWei(object.gasPrice, 'gwei')),
                            // gasLimit: "0x7458",
                            // gasPrice: "0x04e3b29200",
                            data: myData
                        };
                        console.log('txObject: ', txObject);
                        // Sign the transaction
                        const tx = new Tx(txObject, {chain: 'ropsten'});
                        tx.sign(object.privateKey);

                        const serializedTx = tx.serialize();
                        console.log('serializedTx: ', serializedTx);
                        var raw = '0x' + serializedTx.toString('hex');
                        console.log('RAW: ', raw);

                        // web3.eth.sendSignedTransaction(raw)
                        //     // .on('transactionHash', function(hash){
                        //     //     console.log('1 transactionHash: ', hash)
                        //     //     resolve(hash);
                        //     // })
                        //     .on('receipt', function (tx) {
                        //         if(tx)resolve(tx.transactionHash);
                        //         else reject();
                        //     });

                        web3.eth.sendSignedTransaction(raw, (error, hash) => {
                            if(error) reject(false);
                            resolve(hash);
                        })
                    });
                }
            );
        } catch (e) {
            console.log('>> Con transaction err: ',e)
            return false
        }
    }
}
