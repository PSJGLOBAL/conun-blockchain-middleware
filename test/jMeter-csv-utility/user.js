const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const {User} = require('../../models/profile/user');
const _ = require('lodash');
const helper = require('../../app/helper/token.helper')
const Eth = require('../../app/web3/eth.main');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

router.post('/', async (req, res, next) => {
        try {
            if(!req.body.privateKey)
                return res.json({ success: false, message: 'privateKey = null' }).status(400);
            let orgName = 'Org1';
            let _privateKey = req.body.privateKey
            let walletList = [];
            let csvData = [];
            const csvWriter = createCsvWriter({
                path: __dirname+'/dummy/walletList.csv',
                header: [
                    'walletAddress', 'privateKey'
                ]
            });
            for (let i = 0; i < 2; i++) {
                let pKey = _privateKey.slice(2+i.toString().length, _privateKey.length);
                let privateKey = '0x'+`${i}`+pKey;
                console.log('privateKey: ', privateKey, i.toString().length);
                let keyStore = await Eth.TestPrivateKey(privateKey)
                let walletAddress = '0x' + keyStore.address;
                let x509Identity = await helper.getRegisteredUser({
                    walletAddress: walletAddress.toLowerCase(), 
                    orgName: orgName,
                    walletType: 'ETH',
                    keyStore: keyStore,
                    password: '123456'
                });
                let hashed = await Eth.CreateSignature(JSON.stringify(x509Identity), privateKey);
                let user = new User ({
                    orgName: orgName,
                    password: '123456',
                    walletAddress: walletAddress.toLowerCase(),
                    walletSignature: hashed.signature,
                    isAdmin: false
                });

                let walletInfo = {
                    walletAddress: walletAddress,
                    privateKey: privateKey
                }
                walletList.push(walletInfo);
                csvData.push(walletInfo);

                const salt = await bcrypt.genSalt();
                user.password = await bcrypt.hash('123456', salt);
                await user.save();
                console.log('>> count: ', i);
                await sleep(500); 
            }
            csvWriter
                    .writeRecords(csvData)
                    .then(()=> console.log('The CSV file was written successfully'));

            fs.writeFile(__dirname+'/dummy/walletList.json', JSON.stringify(walletList), (err) => {
                if (err) throw err;
                console.log('Data written to file');
            });
            next();
            // res.json({ success: true, message: 'success' }).status(200);
        } catch (e) {
            console.log('error: ', e)
            res.json({ success: false, message: 'error while user creation' }).status(400);
        }
    });

    module.exports = router;
