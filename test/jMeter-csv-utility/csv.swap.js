const express = require('express');
const router = express.Router();
const Web3 = require('web3');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const {User} = require('../../models/profile/user');
const {Swap, validateSwap} = require('../../models/profile/swap.model');
const Eth = require('../../app/web3/eth.main');

const Helper = require('../../common/helper');
const logger = Helper.getLogger('TokenAPI');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');     
const path = require('path');

const provider = new Web3.providers.HttpProvider(process.env.ETHER_HTTP_PROVIDER);
const web3 = new Web3(provider);

router.get('/swap-request/type/:swapType', async (req, res) => {
    let walletList = [];
        let csvData = [];
        let rawdata = fs.readFileSync(path.resolve(__dirname+'/dummy/', 'walletList.json'));
        let walletJson = JSON.parse(rawdata);
        console.log('walletJson: ', walletJson);
        let transactionHash = '0xdaba25c4367b2741a4b5a6530abe17b2ba2106a57b0adedd0075a55e5f756ca1';

        if(req.params.swapType === 'CONtoCONX') {
        for (let i = 0; i < 200; i++) {
            let walletAddress = walletJson[i].walletAddress;
            let _value = Math.floor(Math.random() * 100) + 1;
            let value = web3.utils.toWei(_value.toString())    
            let user = await User.findOne({ walletAddress: walletAddress});
            if (!user)
                return res.status(400).json({payload: 'Not existing wallet address, Please get certifate ', success: false, status: 400});
            let seed = web3.eth.abi.encodeParameters(['string', 'address'], [uuidv4(), walletAddress])
            let _key = web3.utils.sha3(seed, {encoding: 'hex'});
            let swapID = crypto.createHash('sha256').update(_key.slice(2, _key.length), 'hex').digest('hex');
            if (!swapID.includes('0x')) swapID = '0x' + swapID;
            console.log('swapID: ', swapID)
            const encoded = web3.eth.abi.encodeParameters(['bytes32', 'uint256', 'address'], [swapID, value, walletAddress])
            const hash = web3.utils.sha3(encoded, {encoding: 'hex'})
            let hashed = await Eth.CreateSignature(hash, process.env.ADMIN_PRIVATE_KEY);
            let swap = new Swap({
                swapType: req.params.swapType,
                wallet: user._id,
                amount: _value,
                swapID: swapID,
                swapKey: _key,
                messageHash: hashed.messageHash,
                signature: hashed.signature
            })
            let _swap = await swap.save()
            user.swaps.push(swap);
            await user.save();

            let tx = transactionHash.slice(2+i.toString().length, transactionHash.length);
            let txHash = '0x'+`${i}`+tx;

            let transactionInfo = {
                type: 'CONtoCONX',
                from: walletAddress,
                swapID: _swap.swapID,
                transactionHash: txHash
            }
            walletList.push(transactionInfo);
            csvData.push(transactionInfo);
        }
        const csvWriter = createCsvWriter({
            path: __dirname+'/dummy/con-to-conx-swap.csv',
            header: [
                'type', 'from', 'swapID', 'transactionHash'
            ]
        });
        csvWriter
        .writeRecords(csvData)
        .then(()=> console.log('The CSV file was written successfully'));
        fs.writeFile(__dirname+'/dummy/con-to-conx-swap.json', JSON.stringify(walletList), (err) => {
            if (err) throw err;
            console.log('Data written to file');
        });
        res.json({ success: true, message: 'success' }).status(200);
        }



        else if(req.params.swapType === 'CONXtoCON') {
            for (let i = 0; i < 200; i++) {
                let walletAddress = walletJson[i].walletAddress;
                let _value = Math.floor(Math.random() * 100) + 1;
                let value = web3.utils.toWei(_value.toString())    
                let user = await User.findOne({ walletAddress: walletAddress});
                if (!user)
                return res.status(400).json({payload: 'Not existing wallet address, Please get certifate ', success: false, status: 400});
                let seed = web3.eth.abi.encodeParameters(['string', 'address'], [uuidv4(), walletAddress])
                let _key = web3.utils.sha3(seed, {encoding: 'hex'});
                let swapID = crypto.createHash('sha256').update(_key.slice(2, _key.length), 'hex').digest('hex');
                if (!swapID.includes('0x')) swapID = '0x' + swapID;
                console.log('swapID: ', swapID)
                const encoded = web3.eth.abi.encodeParameters(['bytes32', 'uint256', 'address'], [swapID, value, walletAddress])
                const hash = web3.utils.sha3(encoded, {encoding: 'hex'})
                let hashed = await Eth.CreateSignature(hash, process.env.ADMIN_PRIVATE_KEY);    
                let swap = new Swap({
                    swapType: req.params.swapType,
                    wallet: user._id,
                    amount: _value,
                    swapID: swapID,
                    swapKey: _key,
                    messageHash: hashed.messageHash,
                    signature: hashed.signature
                })

                let _swap = await swap.save();     
                user.swaps.push(swap);
                await user.save();

                let tx = transactionHash.slice(2+i.toString().length, transactionHash.length);
                let txHash = '0x'+`${i}`+tx;
    
                let transactionInfo = {
                    type: 'CONXtoCON',
                    from: walletAddress,
                    swapID: _swap.swapID,
                    transactionHash: txHash
                }
                walletList.push(transactionInfo);
                csvData.push(transactionInfo);

            }
            const csvWriter = createCsvWriter({
                path: __dirname+'/dummy/conx-to-con-swap.csv',
                header: [
                    'type', 'from', 'swapID', 'transactionHash'
                ]
            });
            csvWriter
            .writeRecords(csvData)
            .then(()=> console.log('The CSV file was written successfully'));
            fs.writeFile(__dirname+'/dummy/conx-to-con-swap.json', JSON.stringify(walletList), (err) => {
                if (err) throw err;
                console.log('Data written to file');
            });
            res.json({ success: true, message: 'success' }).status(200);
        }
    
});



module.exports = router;