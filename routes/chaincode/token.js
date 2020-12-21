const express = require('express');
const router = express.Router();
const _ = require('lodash');
const invokeHandler = require('../../app/invoke');
const queryHandler = require('../../app/query');
const auth = require('../../middleware/auth');
const verify = require('../../middleware/verify');
const events = require('events');

function CallInvoke(event, req) {
    const eventDeal = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {
            eventDeal.on('Transfer', async () => {
                let result = await invokeHandler.Transfer({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    _from: req.body._from,
                    to: req.body.to,
                    value: req.body.value,
                });
                if(!result) reject(false);
                resolve(result);
            })


            eventDeal.on('Burn', async () => {
                let result = await invokeHandler.Burn({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    admin_wallet: req.body.admin_wallet,
                    amount: req.body.amount,
                });
                if(!result) reject(false);
                resolve(result)
            })


            eventDeal.on('Mint', async () => {
                let result = await invokeHandler.Mint({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    wallet_address: req.body.wallet_address,
                    amount: req.body.amount,
                });
                if(!result) reject(false);
                resolve(result)
            })


            eventDeal.on('Init', async () => {
                let result = await invokeHandler.Init({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    wallet_address: req.body.wallet_address,
                    amount: req.body.amount,
                });
                if(!result) reject(false);
                resolve(result)
            })

            let status = eventDeal.emit(event)
            if (!status) {
                eventDeal.removeAllListeners();
                reject(status);
            }
        }
    )
}

function CallQuery(event, req) {
    const eventQuery = new events.EventEmitter();
    return new Promise (
        (resolve, reject) => {
            eventQuery.on('BalanceOf', async () => {
                console.log('event: ', event);
                let result = await queryHandler.BalanceOf({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn:  req.query.fcn,
                    wallet_address: req.query.wallet_address,
                    orgName: req.query.orgName
                });
                if(!result) reject(false);
                resolve(result)
            })

            eventQuery.on('GetDetails', async () => {
                console.log('event: ', event);
                let result = await queryHandler.GetDetails({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn:  req.query.fcn,
                    wallet_address: req.query.wallet_address,
                    orgName: req.query.orgName
                });
                if(!result) reject(false);
                resolve(result)
            })

            eventQuery.on('ClientAccountID', async () => {
                console.log('event: ', event);
                let result = await queryHandler.ClientAccountID({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn:  req.query.fcn,
                    wallet_address: req.query.wallet_address,
                    orgName: req.query.orgName
                });
                if(!result) reject(false);
                resolve(result)
            })

            let status = eventQuery.emit(event)
            console.log('>> status: ', status);
            if (!status) {
                eventQuery.removeAllListeners();
                reject(status);
            }
        }
    )
}


router.post('/channels/:channelName/chaincodes/:chainCodeName', auth, verify, async (req, res) => {
    try {
        console.log('>> req.body: ', req.body)
        CallInvoke(req.body.fcn, req)
            .then((response) => {
                console.log('>> response: ', response);
                    res.status(200).send({
                            result: response,
                            error: null,
                            errorData: null
                        }
                    );
            }
        ).catch((err)=>  {
            res.status(400).send({
                    result: null,
                    error: err,
                    errorData: 'error while invoking'
                }
            );
        });
    } catch (error) {
        const response_payload = {
            result: error,
            error: 'error.name',
            errorData: 'error.message'
        }
        res.status(400).send(response_payload)
    }
});

router.get('/channels/:channelName/chaincodes/:chainCodeName', auth, verify,async (req, res) => {
    try {
        console.log('params: ', req.params);
        console.log('query: ', req.query);
        console.log('body: ', req.body);
        CallQuery(req.query.fcn, req)
            .then((response) => {
                console.log('response: ', response);
                const response_payload = {
                    result: response,
                    error: null,
                    errorData: null
                }
                res.status(200).send(response_payload);
            }
        ).catch((err) => {
            res.status(400).send({
                    result: null,
                    error: err,
                    errorData: 'error while query'
                }
            );
        });
    } catch (error) {
        const response_payload = {
            result: null,
            error: error,
            errorData: 'error while query'
        }
        res.status(400).send(response_payload)
    }
});
module.exports = router;