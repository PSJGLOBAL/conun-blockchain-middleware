const express = require('express');
const router = express.Router();
const invokeDrive = require('../../../../app/drive/invoke');
const queryDrive = require('../../../../app/drive/query');
const events = require('events');

const Helper = require('../../../../common/helper');
const logger = Helper.getLogger('DriveAPI');

function CallInvokeDrive(event, req) {
    const eventDeal = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {

            /**
            * CreateFile Content
            * POST /ConunDrive/approve/ -> /channels/<channelName>/chaincodes/        <chainCodeName>
	        * curl -i 'http://<host>:<port>/api/v2/<channels>/<chaincode>'
            *
            * Response
            * {
            *     "Fcn": "CreateFile"
            *     "Success": true/false
            *     "TXid":"txid"
            *     "Timestamp": "txTimestamp"
            * }
            *
            */
            eventDeal.on('CreateFile', async () => {
                let result = await invokeDrive.CreateFile({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.content.author,
                    content: req.body.content,
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });

            /**
            * Approve Content
            * GET /ConunDrive/approve/ -> /channels/<channelName>/chaincodes/        <chainCodeName>
	        * curl -i 'http://<host>:<port>/api/v2/<channels>/<chaincode>'
            *
            * Response
            * {
            *     "Fcn": "Approve"
            *     "Success": true/false
            *     "TXid":"txid"
            *     "Timestamp": "txTimestamp"
            * }
            *
            */
            eventDeal.on('Approve', async () => {
                let result = await invokeDrive.ApproveFile({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    author: req.body.author,
                    ccid : req.body.ccid,
                    spenders : req.body.spenders
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });



            /**
            * LikeContent Content
            * POST /ConunDrive/approve/ -> /channels/<channelName>/chaincodes/        <chainCodeName>
	        * curl -i 'http://<host>:<port>/api/v2/<channels>/<chaincode>'
            *
            * Response
            * {
            *     "Fcn": "LikeContent"
            *     "Success": true/false
            *     "TXid":"txid"
            *     "Timestamp": "txTimestamp"
            * }
            *
            */
            eventDeal.on('LikeContent', async () => {
                let result = await invokeDrive.LikeContentFile({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.action.wallet,
                    action : req.body.action
                });
                console.log('LikeContent result: ', result);
                if(!result.status) reject(result.message);
                resolve(result.message);
            });


            /**
            * CountDownloads Content
            * POST /ConunDrive/approve/ -> /channels/<channelName>/chaincodes/        <chainCodeName>
	        * curl -i 'http://<host>:<port>/api/v2/<channels>/<chaincode>'
            *
            * Response
            * {
            *     "Fcn": "CountDownloads"
            *     "Success": true/false
            *     "TXid":"txid"
            *     "Timestamp": "txTimestamp"
            * }
            *
            */
            eventDeal.on('CountDownloads', async () => {
                let result = await invokeDrive.CountDownloadsFile({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.action.wallet,
                    action: req.body.action
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });


            let status = eventDeal.emit(event);
            if (!status) {
                eventDeal.removeAllListeners();
                reject('not valid request to chain-code');
            }
        }
    )
}


function CallQueryDrive(event, req) {
    const eventQuery = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {


            /**
            * Allowance Content
            * GET /ConunDrive/approve/ -> /channels/<channelName>/chaincodes/        <chainCodeName>
	        * curl -i 'http://<host>:<port>/api/v2/<channels>/<chaincode>'
            *
            * Response
            * {
            *     "bool" true/false
            * }
            *
            */
            eventQuery.on('Allowance', async () => {
                let result = await queryDrive.AllowanceFile({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.query.fcn,
                    orgName: req.query.orgName,
                    walletAddress: req.query.walletAddress,
                    ccid : req.query.ccid
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });



            /**
            * GetTotalLikes Content
            * GET /ConunDrive/approve/ -> /channels/<channelName>/chaincodes/        <chainCodeName>
	        * curl -i 'http://<host>:<port>/api/v2/<channels>/<chaincode>'
            *
            * Response
            * {
            *     "Count" totalLikes
            * }
            *
            */

            eventQuery.on('GetTotalLikes', async () => {
            let result = await queryDrive.GetTotalLikesFile({
                channelName: req.params.channelName,
                chainCodeName: req.params.chainCodeName,
                fcn: req.query.fcn,
                orgName: req.query.orgName,
                walletAddress: req.query.walletAddress,
                ccid : req.query.ccid
            });
            if(!result.status) reject(result.message);
            resolve(result.message);
            });


            /**
            * GetTotalDownloads Content
            * GET /ConunDrive/approve/ -> /channels/<channelName>/chaincodes/        <chainCodeName>
	        * curl -i 'http://<host>:<port>/api/v2/<channels>/<chaincode>'
            *
            * Response
            * {
            *     "Count" totalDownloads
            * }
            *
            */

            eventQuery.on('GetTotalDownloads', async () => {
            let result = await queryDrive.GetTotalDownloads({
                channelName: req.params.channelName,
                chainCodeName: req.params.chainCodeName,
                fcn: req.query.fcn,
                orgName: req.query.orgName,
                walletAddress: req.query.walletAddress,
                ccid : req.query.ccid
            });
            if(!result.status) reject(result.message);
            resolve(result.message);
            });


            /**
            * GetFile Content
            * GET /ConunDrive/approve/ -> /channels/<channelName>/chaincodes/        <chainCodeName>
	        * curl -i 'http://<host>:<port>/api/v2/<channels>/<chaincode>'
            *
            * Response
            * {
            *     "file" hashFile
            * }
            *
            */

            eventQuery.on('GetFile', async () => {
            let result = await queryDrive.GetFile({
                channelName: req.params.channelName,
                chainCodeName: req.params.chainCodeName,
                fcn: req.query.fcn,
                orgName: req.query.orgName,
                walletAddress: req.query.walletAddress,
                ccid : req.query.ccid
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

router.post('/:channelName/:chainCodeName', async (req, res) => {
    try {
        CallInvokeDrive(req.body.fcn, req)
            .then((response) => {
                    res.status(200).json({
                            payload: response,
                            success: true,
                            status: 200
                        }
                    );
                }
            ).catch((error) => {
            console.log(`Drive Post CallInvokeDrive 1: Type: ${req.body.fcn} Reqeest: ${JSON.stringify(req.body)} `, error);
            logger.error(`Drive Post CallInvokeDrive 1: Type: ${req.body.fcn} Reqeest: ${JSON.stringify(req.body)} `, error);
            res.status(400).json({
                    payload: error,
                    success: false,
                    status: 400
                }
            );
        });
    } catch (error) {
        console.log(`Drive Post CallInvokeDrive 2: Type: ${req.body.fcn} Reqeest: ${JSON.stringify(req.body)} `, error);
        logger.error(`Drive Post CallInvokeDrive 2: Type: ${req.body.fcn} Reqeest: ${JSON.stringify(req.body)} `, error);
        res.status(400).json({
            payload: error.message,
            success: false,
            status: 400
        })
    }
});


router.get('/:channelName/:chainCodeName', async (req, res) => {
    try {
        CallQueryDrive(req.query.fcn, req)
            .then((response) => {
                    res.status(200).json({
                        payload: response,
                        success: true,
                        status: 200
                    });
                }
            ).catch((error) => {
            logger.error(`Drive Post CallQueryDrive 1: Type: ${req.query.fcn} Reqeest: ${req.query} `, error);
            res.status(400).json({
                payload: error,
                success: false,
                status: 400
            });
        });
    } catch (error) {
        logger.error(`Drive Post CallQueryDrive 2: Type: ${req.query.fcn} Reqeest: ${req.query} `, error);
        res.status(400).json({
            payload: error.message,
            success: false,
            status: 400
        })
    }
});


module.exports = router;
