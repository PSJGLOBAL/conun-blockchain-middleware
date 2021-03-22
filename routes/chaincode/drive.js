const express = require('express');
const router = express.Router();
const _ = require('lodash');
const invokeHandler = require('../../app/invoke');
const queryHandler = require('../../app/query');
const auth = require('../../middleware/auth');
const owner = require('../../middleware/owner');
const x509 = require('../../middleware/x509');
const events = require('events')

function CallInvokeDrive(event, req) {
    const eventDeal = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {
            eventDeal.on('CreateFile', async () => {
                //todo result = await CreateFile
                if(!result) reject(false);
                resolve(result);
            })

            eventDeal.on('Approve', async () => {
                //todo result = await Approve
                if(!result) reject(false);
                resolve(result);
            })

            eventDeal.on('Allowance', async () => {
                //todo result = await Allowance
                if(!result) reject(false);
                resolve(result);
            })

            eventDeal.on('LikeContent', async () => {
                //todo result = await LikeContent
                if(!result) reject(false);
                resolve(result);
            })

            eventDeal.on('CountDownloads', async () => {
                //todo result = await CountDownloads
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

            eventQuery.on('GetTotalLikes', async () => {
            //todo result = await GetTotalLikes
                if(!result) reject(false);
            resolve(result);
            })

            eventQuery.on('GetTotalDownloads', async () => {
            //todo result = await GetTotalDownloads
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

router.post('/channels/:channelName/chaincodes/:chainCodeName', auth, owner, x509.verify, async (req, res) => {

});


router.get('/channels/:channelName/chaincodes/:chainCodeName', auth, async (req, res) => {

});


module.exports = router;
