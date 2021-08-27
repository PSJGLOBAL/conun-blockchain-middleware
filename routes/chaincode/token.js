const express = require('express');
const router = express.Router();
const invokeHandler = require('../../app/invoke');
const queryHandler = require('../../app/query');
const auth = require('../../middleware/auth');
const events = require('events');
const Helper = require('../../common/helper');
const logger = Helper.getLogger('TokenAPI');

function CallInvoke(event, req) {
    const eventDeal = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {
            eventDeal.on('Init', async () => {
                let result = await invokeHandler.Init({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.walletAddress,
                    messageHash: req.body.messageHash,
                    signature: req.body.signature
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });
            // todo MintAndTransfer
            eventDeal.on('MintAndTransfer', async () => {
                let result = await invokeHandler.MintAndTransfer({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.walletAddress,
                    amount: req.body.amount,
                    messageHash: req.body.messageHash,
                    signature: req.body.signature
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });
            //todo BurnFrom
            eventDeal.on('BurnFrom', async () => {
                let result = await invokeHandler.BurnFrom({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.walletAddress,
                    amount: req.body.amount,
                    messageHash: req.body.messageHash,
                    signature: req.body.signature
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });

            eventDeal.on('Transfer', async () => {
                let result = await invokeHandler.Transfer({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.fromAddress,
                    to: req.body.toAddress,
                    value: req.body.value,
                    messageHash: req.body.messageHash,
                    signature: req.body.signature
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });


            let status = eventDeal.emit(event)
            if (!status) {
                console.log('CallInvoke - > status: ', status)
                eventDeal.removeAllListeners();
                reject('not valid request to chain-code');
            }
        }
    )
}

function CallQuery(event, req) {
    const eventQuery = new events.EventEmitter();
    return new Promise (
        (resolve, reject) => {
            eventQuery.on('BalanceOf', async () => {
                let result = await queryHandler.BalanceOf({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn:  req.query.fcn,
                    walletAddress: req.query.walletAddress,
                    orgName: req.query.orgName
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            })

            eventQuery.on('GetDetails', async () => {
                let result = await queryHandler.GetDetails({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn:  req.query.fcn,
                    walletAddress: req.query.walletAddress,
                    orgName: req.query.orgName
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            })

            eventQuery.on('ClientAccountID', async () => {
                let result = await queryHandler.ClientAccountID({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn:  req.query.fcn,
                    walletAddress: req.query.walletAddress,
                    orgName: req.query.orgName
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });

            let status = eventQuery.emit(event);
            if (!status) {
                eventQuery.removeAllListeners();
                reject('not valid request to chain-code');
            }
        }
    )
}

router.post('/channels/:channelName/chaincodes/:chainCodeName', auth, async (req, res) => {
    try {
        CallInvoke(req.body.fcn, req)
            .then((response) => {
                    res.status(200).json({
                            payload: response,
                            success: true,
                            status: 200
                        }
                    );
            }
        ).catch((error) => {
            logger.error(`Token Post CallInvoke 1: Type: ${req.body.fcn} Reqeest: ${req.body} `, error);
            res.status(400).json({
                    payload: error,
                    success: false,
                    status: 400
                }
            );
        });
    } catch (error) {
        logger.error(`Token Post CallInvoke 2: Type: ${req.body.fcn} Reqeest: ${req.body} `, error);
        res.status(400).json({
            payload: error.message,
            success: false,
            status: 400
        })
    }
});

router.get('/channels/:channelName/chaincodes/:chainCodeName', auth, async (req, res) => {
    try {
        CallQuery(req.query.fcn, req)
            .then((response) => {
                res.status(200).json({
                    payload: response,
                    success: true,
                    status: 200
                });
            }
        ).catch((error) => {
            logger.error(`Token Post CallQuery 1: Type: ${req.query.fcn} `, error);
            res.status(400).json({
                payload: error,
                success: false,
                status: 400
            });
        });
    } catch (error) {
        logger.error(`Token Post CallQuery 2: Type: ${req.query.fcn}`, error)
        res.status(400).json({
            payload: error.message,
            success: false,
            status: 400
        })
    }
});

module.exports = router;
