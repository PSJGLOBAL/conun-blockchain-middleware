const express = require('express');
const router = express.Router();
const invokeHandler = require('../../app/invoke');
const queryHandler = require('../../app/query');
const auth = require('../../middleware/auth');
const events = require('events');
const Helper = require('../../common/helper');
const logger = Helper.getLogger('TokenAPI');


router.post('/channels/:channelName/chaincodes/:chainCodeName', auth, async (req, res) => {

});


router.get('/channels/:channelName/chaincodes/:chainCodeName', auth, async (req, res) => {
    
});