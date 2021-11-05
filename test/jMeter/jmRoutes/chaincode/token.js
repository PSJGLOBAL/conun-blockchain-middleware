const express = require('express');
const router = express.Router();
const Invoke = require('../../../../app/invoke');
const queryHandler = require('../../../../app/query');
const events = require('events');
const Helper = require('../../../../common/helper');
const logger = Helper.getLogger('TokenAPI');

function CallInvoke(event, req) {
    const eventDeal = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {
            eventDeal.on('MintAndTransfer', async () => {
                const invokeHandler = new Invoke();
                invokeHandler.conxMintAndTransfer({
                    channelName: 'mychannel',
                    chainCodeName: 'conx',
                    fcn: req.body.fcn,
                    orgName: 'Org1',
                    walletAddress: req.body.adminWalletAddress,
                    toAddress: req.body.toAddress,
                    amount: req.body.amount,
                    messageHash: req.body.messageHash,
                    signature: req.body.signature,
                    mintId: req.body.mintId.slice(2, req.body.mintId.length)
                })
                .then((result)=> {
                    resolve(result.message);
                })
                .catch((err)=> {
                    reject(err.message);
                })
            });
            
            eventDeal.on('BurnFrom', async () => {
                const invokeHandler = new Invoke();
                invokeHandler.conxBurnFrom({
                    channelName: 'mychannel',
                    chainCodeName: 'conx',
                    fcn: req.body.fcn,
                    orgName: 'Org1',
                    walletAddress: req.body.adminWalletAddress,
                    fromAddress: req.body.fromAddress,
                    amount: req.body.amount,
                    messageHash: req.body.messageHash,
                    signature: req.body.signature,
                    burnId: req.body.burnId.slice(2, req.body.burnId.length)
                })
                .then((result)=> {
                    resolve(result.message);
                })
                .catch((err)=> {
                    reject(err.message);
                })
            });

            eventDeal.on('Transfer', async () => {
                const invokeHandler = new Invoke();
                invokeHandler.conxTransfer({
                    channelName: 'mychannel',
                    chainCodeName: 'conx',
                    fcn: req.body.fcn,
                    orgName: 'Org1',
                    walletAddress: req.body.fromAddress,
                    to: req.body.toAddress,
                    amount: req.body.value,
                    messageHash: req.body.messageHash,
                    signature: req.body.signature
                })
                .then((result)=> {
                    resolve(result.message);
                })
                .catch((err)=> {
                    reject(err.message);
                })
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
                queryHandler.BalanceOf({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn:  req.query.fcn,
                    walletAddress: req.query.walletAddress,
                    orgName: req.query.orgName
                })
                .then((result)=> {
                    resolve(result.message);
                })
                .catch((err)=> {
                    reject(err.message);
                })
            })

            eventQuery.on('GetDetails', async () => {
                queryHandler.GetDetails({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn:  req.query.fcn,
                    walletAddress: req.query.walletAddress,
                    orgName: req.query.orgName
                })
                .then((result)=> {
                    resolve(result.message);
                })
                .catch((err)=> {
                    reject(err.message);
                })
            })

            eventQuery.on('ClientAccountID', async () => {
                queryHandler.ClientAccountID({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn:  req.query.fcn,
                    walletAddress: req.query.walletAddress,
                    orgName: req.query.orgName
                })
                .then((result)=> {
                    resolve(result.message);
                })
                .catch((err)=> {
                    reject(err.message);
                })
            });

            let status = eventQuery.emit(event);
            if (!status) {
                eventQuery.removeAllListeners();
                reject('not valid request to chain-code');
            }
        }
    )
}

router.post('/channels/:channelName/chaincodes/:chainCodeName', async (req, res) => {
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

router.get('/channels/:channelName/chaincodes/:chainCodeName', async (req, res) => {
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
