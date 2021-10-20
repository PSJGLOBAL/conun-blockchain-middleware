
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
                'id', 'fromAddress', 'toAddress', 'value', 'messageHash', 'signature'
            ]
        });
        for (let i = 0; i < 100; i++) {
            let fromAddress = walletJson[i].walletAddress;
            let toAddress =   walletJson[i+1].walletAddress;
            let _value = Math.floor(Math.random() * 100) + 1;
            console.log('_value: ',_value)
            let value = web3.utils.toWei(_value.toString())
            const encoded = web3.eth.abi.encodeParameters(['uint256', 'address'], [value, fromAddress])
            const hash = web3.utils.sha3(encoded, {encoding: 'hex'})
            let hashed = await Eth.CreateSignature(hash, process.env.ADMIN_PRIVATE_KEY)
            let transactionInfo = {
                id: i,
                fromAddress: fromAddress, 
                toAddress: toAddress,
                value: value, 
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
    * channelName: req.params.channelName,
    * chainCodeName: req.params.chainCodeName,
    * fcn: req.body.fcn,
    * orgName: req.body.orgName,
    * walletAddress: req.body.walletAddress,
    * amount: req.body.amount,
    * messageHash: req.body.messageHash,
    *signature: req.body.signature
    */


// todo BurnFrom csv
    /**
    * channelName: req.params.channelName,
    * chainCodeName: req.params.chainCodeName,
    * fcn: req.body.fcn,
    * orgName: req.body.orgName,
    * walletAddress: req.body.walletAddress,
    * amount: req.body.amount,
    * messageHash: req.body.messageHash,
    * signature: req.body.signature
    */


module.exports = router;

