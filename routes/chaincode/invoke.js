const express = require('express');
const router = express.Router();
const _ = require('lodash');
const invoke = require('../../app/invoke');
const query = require('../../app/query');
const auth = require('../../middleware/auth');

router.post('/channels/:channelName/chaincodes/:chaincodeName', auth, async (req, res) => {
    try {
        // logger.debug('==================== INVOKE ON CHAINCODE ==================');
        console.log('>> req', req.body)
        // var peers = req.body.peers;
        var chaincodeName = req.params.chaincodeName;
        var channelName = req.params.channelName;
        var fcn = req.body.fcn;
        var args = req.body.args;
        console.log('args: ', args);
        // logger.debug('channelName  : ' + channelName);
        // logger.debug('chaincodeName : ' + chaincodeName);
        // logger.debug('fcn  : ' + fcn);
        // logger.debug('args  : ' + args);
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
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }

        let message = await invoke.invokeTransaction(channelName, chaincodeName, fcn, args, req.body.wallet_address, req.body.orgname);
        console.log(`message result is : ${message}`)

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

router.get('/channels/:channelName/chaincodes/:chaincodeName', auth, async (req, res) => {
    try {
        // logger.debug('==================== QUERY BY CHAINCODE ==================');
        // console.log('==================== QUERY BY CHAINCODE ==================');

        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is :${chaincodeName}`)
        console.log(`channel name is :${channelName}`)

        let fcn = req.query.fcn;
        //  let args = req.query.args;
        //   let peer = req.query.peer;
        console.log(`func name is :${fcn}`)

        // logger.debug('channelName : ' + channelName);
        // logger.debug('chaincodeName : ' + chaincodeName);
        // logger.debug('fcn : ' + fcn);
        // logger.debug('args : ' + args);

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
        // if (!args) {
        //     res.json(getErrorMessage('\'args\''));
        //     return;
        // }
        // console.log('args==========', args);
        // args = args.replace(/'/g, '"');
        // args = JSON.parse(args);
        // logger.debug(args);

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