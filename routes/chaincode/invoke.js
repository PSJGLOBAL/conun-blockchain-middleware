const express = require('express');
const router = express.Router();
const _ = require('lodash');
const invokeHandler = require('../../app/invoke');
const query = require('../../app/query');
const auth = require('../../middleware/auth');
const events = require('events');

function CallInvoke(event, req) {
    const eventDeal = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {
            eventDeal.on('BalanceOf', async () => {
                let result = await invokeHandler.BalanceOf({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    wallet_address: req.body.wallet_address
                });
                resolve(result)
            })

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

            let status = eventDeal.emit(event)
            if (!status) {
                eventDeal.removeAllListeners();
                reject(status);
            }
        }
    )
}

router.post('/channels/:channelName/chaincodes/:chainCodeName', auth, async (req, res) => {
    try {
        console.log('>> req: ', req.body);
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

router.get('/channels/:channelName/chaincodes/:chaincodeName', auth, async (req, res) => {
    try {
        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is :${chaincodeName}`)
        console.log(`channel name is :${channelName}`)

        let fcn = req.query.fcn;
        console.log(`func name is :${fcn}`)

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
            return;
        }

        let message = await query.query(channelName, chaincodeName, fcn, req.wallet_address, req.orgname);

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: 'error.name',
            errorData: 'error.message'
        }
        res.send(response_payload)
    }
});

module.exports = router;