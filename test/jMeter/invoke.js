const express = require('express');
const router = express.Router();
const _ = require('lodash');
const invokeHandler = require('../../app/invoke');
const queryHandler = require('../../app/query');
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
                    value: Math.floor(Math.random() * 20),
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
                    amount: 1000,
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
    return new Promise(
        (resolve, reject) => {
            eventQuery.on('BalanceOf', async () => {
                console.log('event: ', event);
                let result = await queryHandler.query({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn:  req.query.fcn,
                    wallet_address: req.query.wallet_address,
                    orgName: req.query.orgName
                });
                resolve(result)
            })

            eventQuery.on('TotalSupply', async () => {
                //TODO Get TotalSupply
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
        console.log('>> req: ', req.body);
        let response = await CallInvoke(req.body.fcn, req);
        console.log('response: ', await response);
        res.status(200).send({
                result: await response,
                error: null,
                errorData: null
            }
        );
    } catch (error) {
        const response_payload = {
            result: null,
            error: 'error.name',
            errorData: 'error.message'
        }
        res.send(response_payload).status(400)
    }
});

router.get('/channels/:channelName/chaincodes/:chainCodeName', async (req, res) => {
    try {
        let response = await CallQuery(req.query.fcn, req);
        console.log('response: ', response);
        const response_payload = {
            result: response,
            error: null,
            errorData: null
        }
        res.status(200).send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: 'error.name',
            errorData: 'error.message'
        }
        res.status(400).send(response_payload);
    }
});

module.exports = router;