const express = require('express');
const router = express.Router();
const _ = require('lodash');
const invokeHandler = require('../../app/invoke');
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
                    orgName: 'Org1',
                    _from: req.body._from,
                    to: req.body.to,
                    value: Math.floor(Math.random() * 100),
                });
                resolve(result);
            })

            eventDeal.on('Mint', async () => {
                let result = await invokeHandler.Mint({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: 'Org1',
                    wallet_address: req.body.wallet_address,
                    amount: Math.floor(Math.random() * 100),
                });
                resolve(result)
            })

            eventDeal.on('BalanceOf', async () => {
                let result = await invokeHandler.BalanceOf({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: 'Org1',
                    wallet_address: req.body.wallet_address
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

router.post('/channels/:channelName/chaincodes/:chainCodeName', async (req, res) => {
    try {
        console.log('>> req: ', req.body);
        let response = await CallInvoke(req.body.fcn, req);
        console.log('response: ', await response);
        res.send({
                result: await response,
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

module.exports = router;