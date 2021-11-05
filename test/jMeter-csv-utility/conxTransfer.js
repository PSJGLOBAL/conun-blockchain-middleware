
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const {User} = require('../../models/profile/user');
const _ = require('lodash');
const helper = require('../../app/helper/token.helper')
const Eth = require('../../app/web3/eth.main');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');     
const path = require('path');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(process.env.ETHER_HTTP_PROVIDER);
const web3 = new Web3(provider);

// todo Transfer csv
    /**
    * walletAddress: req.body.fromAddress,
    * to: req.body.toAddress,
    * amount: req.body.value,
    * messageHash: req.body.messageHash,
    * signature: req.body.signature
    */

router.get('/transfer-csv', async (req, res) => {
    try {
        let walletList = [];
        let csvData = [];
        let rawdata = fs.readFileSync(path.resolve(__dirname+'/dummy/', 'walletList.json'));
        let walletJson = JSON.parse(rawdata);
        console.log('walletJson: ', walletJson);
        const csvWriter = createCsvWriter({
            path: __dirname+'/dummy/conx-transaction.csv',
            header: [
                'fcn', 'fromAddress', 'toAddress', 'value', 'messageHash', 'signature'
            ]
        });
        for (let i = 0; i < 2; i++) {
            let fromAddress = walletJson[i].walletAddress;
            let fromAddressPk = walletJson[i].privateKey
            let toAddress =   walletJson[i+1].walletAddress;
            let _value = Math.floor(Math.random() * 100) + 1;
            let value = web3.utils.toWei(_value.toString(), 'ether')
            const encoded = web3.eth.abi.encodeParameters(['uint256', 'address'], [value, toAddress])
            const hash = web3.utils.sha3(encoded, {encoding: 'hex'})
            let hashed = await Eth.CreateSignature(hash, fromAddressPk.slice(2, fromAddressPk.length));
            let transactionInfo = {
                fcn: 'Transfer',
                fromAddress: fromAddress, 
                toAddress: toAddress,
                value: _value, 
                messageHash: hashed.messageHash,
                signature: hashed.signature
            }
            walletList.push(transactionInfo);
            csvData.push(transactionInfo);
            i++;
        }
        csvWriter
        .writeRecords(csvData)
        .then(()=> console.log('The CSV file was written successfully'));
        fs.writeFile(__dirname+'/dummy/conx-transaction.json', JSON.stringify(walletList), (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });
        res.json({ success: true, message: 'success' }).status(200);
    } catch (e) {
        console.log('error: ', e)
        res.json({ success: false, message: 'error while user creation' }).status(400);
    }
});

// todo MintAndTransfer csv
    /**
    * walletAddress: req.body.walletAddress,
    * amount: req.body.amount,
    * messageHash: req.body.messageHash,
    *signature: req.body.signature
    */
router.get('/mintAndTransfer-csv', async (req, res) => {
    try {
        let adminWalletAddress = process.env.ADMIN_WALLET
        let adminPk = process.env.ADMIN_PRIVATE_KEY
        let walletList = [];
        let csvData = [];
        let rawdata = fs.readFileSync(path.resolve(__dirname+'/dummy/', 'walletList.json'));
        let walletJson = JSON.parse(rawdata);
        const csvWriter = createCsvWriter({
            path: __dirname+'/dummy/conx-mintAndTransfer.csv',
            header: [
                'fcn', 'adminWalletAddress', 'toAddress', 'amount', 'messageHash', 'signature', 'mintId'
            ]
        });
        for (let i = 0; i < 2; i++) {
            let toAddress = walletJson[i].walletAddress;
            let _mintId = '0xdad693d9830bec57a841eec67ff6ca452a0e2e6126b27a1bb1732858d95de1df'
            let _value = '100';
            console.log('_value: ',_value)
            let value = web3.utils.toWei(_value, 'ether');
            const encoded = web3.eth.abi.encodeParameters(['bytes32', 'uint256', 'address'], [_mintId, value, toAddress])
            const hash = web3.utils.sha3(encoded, {encoding: 'hex'})
            let hashed = await Eth.CreateSignature(hash, adminPk);
            let transactionInfo = {
                fcn: 'MintAndTransfer',
                adminWalletAddress: adminWalletAddress,
                toAddress: toAddress, 
                amount: _value,
                messageHash: hashed.messageHash,
                signature: hashed.signature,
                mintId: _mintId
            }
            walletList.push(transactionInfo);
            csvData.push(transactionInfo);
        }
        csvWriter
        .writeRecords(csvData)
        .then(()=> console.log('The CSV file was written successfully'));
        fs.writeFile(__dirname+'/dummy/conx-mintAndTransfer.json', JSON.stringify(walletList), (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });
        res.json({ success: true, message: 'success' }).status(200);
    } catch (e) {
        console.log('error: ', e)
        res.json({ success: false, message: 'error while user creation' }).status(400);
    }
});

// todo BurnFrom csv
    /**
    * walletAddress: req.body.walletAddress,
    * amount: req.body.amount,
    * messageHash: req.body.messageHash,
    * signature: req.body.signature
    */
router.get('/burnFrom-csv', async (req, res) => {
    try {
        let adminWalletAddress = process.env.ADMIN_WALLET
        let adminPk = process.env.ADMIN_PRIVATE_KEY
        let walletList = [];
        let csvData = [];
        let rawdata = fs.readFileSync(path.resolve(__dirname+'/dummy/', 'walletList.json'));
        let walletJson = JSON.parse(rawdata);
        const csvWriter = createCsvWriter({
            path: __dirname+'/dummy/conx-burnFrom.csv',
            header: [
                'fcn', 'adminWalletAddress', 'fromAddress', 'amount', 'messageHash', 'signature', 'burnId'
            ]
        });
        for (let i = 0; i < 2; i++) {
            let fromAddress = walletJson[i].walletAddress;
            let _burnId = '0xdad693d9830bec57a841eec67ff6ca452a0e2e6126b27a1bb1732858d95de1df'
            let _value = '100';
            console.log('_value: ', _value)
            let value = web3.utils.toWei(_value, 'ether')
            const encoded = web3.eth.abi.encodeParameters(['bytes32', 'uint256', 'address'], [_burnId, value, fromAddress])
            const hash = web3.utils.sha3(encoded, {encoding: 'hex'})
            let hashed = await Eth.CreateSignature(hash, adminPk);
            let transactionInfo = {
                fcn: 'BurnFrom',
                adminWalletAddress: adminWalletAddress,
                fromAddress: fromAddress, 
                amount: _value,
                messageHash: hashed.messageHash,
                signature: hashed.signature,
                burnId: _burnId
            }
            walletList.push(transactionInfo);
            csvData.push(transactionInfo);
        }
        csvWriter
        .writeRecords(csvData)
        .then(()=> console.log('The CSV file was written successfully'));
        fs.writeFile(__dirname+'/dummy/conx-burnFrom.json', JSON.stringify(walletList), (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });
        res.json({ success: true, message: 'success' }).status(200);
    } catch (e) {
        console.log('error: ', e)
        res.json({ success: false, message: 'error while user creation' }).status(400);
    }
});

module.exports = router;

