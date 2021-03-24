const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const owner = require('../../middleware/owner');
const x509 = require('../../middleware/x509');
const invokeDrive = require('../../app/drive/invoke')
const queryDrive = require('../../app/drive/query')
const events = require('events')

function CallInvokeDrive(event, req) {
    const eventDeal = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {
            eventDeal.on('CreateFile', async () => {
                let result = await invokeDrive.CreateFile({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.authorWalletAddress,
                    ipfsHash : req.body.ipfsHash
                })
                if(!result) reject(false);
                resolve(result);
            })

            eventDeal.on('Approve', async () => {
                let result = await invokeDrive.ApproveFile({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    author: req.body.author,
                    ipfsHash : req.body.ipfsHash,
                    spenders : req.body.spenders
                })
                if(!result) reject(false);
                resolve(result);
            })


            eventDeal.on('LikeContent', async () => {
                let result = await invokeDrive.LikeContentFile({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.walletAddress,
                    ipfsHash : req.body.ipfsHash
                })
                if(!result) reject(false);
                resolve(result);
            })

            eventDeal.on('CountDownloads', async () => {
                let result = await invokeDrive.CountDownloadsFile({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.walletAddress,
                    ipfsHash : req.body.ipfsHash
                })
                if(!result) reject(false);
                resolve(result);
            })


            let status = eventDeal.emit(event)
            if (!status) {
                eventDeal.removeAllListeners();
                reject(status);
            }
        }
    )
}


function CallQueryDrive(event, req) {
    const eventQuery = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {
            eventQuery.on('Allowance', async () => {
                let result = await queryDrive.AllowanceFile({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.query.fcn,
                    orgName: req.query.orgName,
                    walletAddress: req.query.walletAddress,
                    ipfsHash : req.query.ipfsHash
                })
                if(!result) reject(false);
                resolve(result);
            })
            eventQuery.on('GetTotalLikes', async () => {
            let result = await queryDrive.GetTotalLikesFile({
                channelName: req.params.channelName,
                chainCodeName: req.params.chainCodeName,
                fcn: req.query.fcn,
                orgName: req.query.orgName,
                walletAddress: req.query.walletAddress,
                ipfsHash : req.query.ipfsHash
            })
            if(!result) reject(false);
            resolve(result);
            })

            eventQuery.on('GetTotalDownloads', async () => {
            let result = await queryDrive.GetTotalDownloads({
                channelName: req.params.channelName,
                chainCodeName: req.params.chainCodeName,
                fcn: req.query.fcn,
                orgName: req.query.orgName,
                walletAddress: req.query.walletAddress,
                ipfsHash : req.query.ipfsHash
            })
            if(!result) reject(false);
            resolve(result);
            })

            let status = eventQuery.emit(event)
            if (!status) {
                eventQuery.removeAllListeners();
                reject(status);
            }
        }
    )
}

router.post('/channels/:channelName/chaincodes/:chainCodeName', async (req, res) => {
    try {
        CallInvokeDrive(req.body.fcn, req)
            .then((response) => {
                    console.log('>> response: ', response);
                    res.status(200).json({
                            payload: response,
                            success: true,
                            status: 200
                        }
                    );
                }
            ).catch((error) => {
                console.log('1/channels: ', error)
            res.status(400).json({
                    payload: error.message,
                    success: false,
                    status: 400
                }
            );
        });
    } catch (error) {
        console.log('2/channels: ', error)
        res.status(400).json({
            payload: error.message,
            success: false,
            status: 400
        })
    }
});


router.get('/channels/:channelName/chaincodes/:chainCodeName', async (req, res) => {
    try {
        CallQueryDrive(req.query.fcn, req)
            .then((response) => {
                    console.log('response: ', response);
                    res.status(200).json({
                        payload: response,
                        success: true,
                        status: 200
                    });
                }
            ).catch((error) => {
            res.status(400).json({
                payload: error.message,
                success: false,
                status: 400
            });
        });
    } catch (error) {
        res.status(400).json({
            payload: error.message,
            success: false,
            status: 400
        })
    }
});


module.exports = router;
