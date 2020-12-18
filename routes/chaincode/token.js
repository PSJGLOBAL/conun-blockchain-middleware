const express = require('express');
const router = express.Router();
const _ = require('lodash');
const invokeHandler = require('../../app/invoke');
const queryHandler = require('../../app/query');
const auth = require('../../middleware/auth');
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
                resolve(result)
            })

            let status = eventQuery.emit(event)
            if (!status) {
                eventQuery.removeAllListeners();
                reject(status);
            }
        }
    )
}


router.post('/channels/:channelName/chaincodes/:chainCodeName', auth, async (req, res) => {
    try {
        let response = await CallInvoke(req.body.fcn, req);
        console.log('response: ', response);
        res.send({
                result: response,
                error: null,
                errorData: null
            }
        ).status(200);
    } catch (error) {
        const response_payload = {
            result: null,
            error: 'error.name',
            errorData: 'error.message'
        }
        res.send(response_payload).status(400)
    }
});

router.get('/channels/:channelName/chaincodes/:chainCodeName', auth, async (req, res) => {
    try {
        console.log('params: ', req.params);
        console.log('query: ', req.query);
        console.log('body: ', req.body);
        let response = await CallQuery(req.query.fcn, req);
        console.log('response: ', response);
        const response_payload = {
            result: response,
            error: null,
            errorData: null
        }
        res.send(response_payload).status(200);
    } catch (error) {
        const response_payload = {
            result: null,
            error: 'error.name',
            errorData: 'error.message'
        }
        res.send(response_payload).status(400)
    }
});
module.exports = router;