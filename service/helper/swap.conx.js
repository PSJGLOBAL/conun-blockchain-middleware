const invokeHandler = require('../../app/invoke');
const queryHandler = require('../../app/query');
const events = require('events');
const Helper = require('../../common/helper');
const logger = Helper.getLogger('TokenAPI');

function CallInvokeSwap(event, req) {
    const eventDeal = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {
            eventDeal.on('MintAndTransfer', async () => {
                let result = await invokeHandler.MintAndTransfer({
                    channelName: req.channelName,
                    chainCodeName: req.chainCodeName,
                    fcn: req.fcn,
                    orgName: req.orgName,
                    id: req.id,
                    key: req.key,
                    walletAddress: req.walletAddress,
                    amount: req.amount,
                    messageHash: req.messageHash,
                    signature: req.signature
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });

            eventDeal.on('BurnFrom', async () => {
                let result = await invokeHandler.BurnFrom({
                    channelName: req.channelName,
                    chainCodeName: req.chainCodeName,
                    fcn: req.fcn,
                    orgName: req.orgName,
                    id: req.id,
                    walletAddress: req.walletAddress,
                    amount: req.amount,
                    messageHash: req.messageHash,
                    signature: req.signature
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
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

module.exports = CallInvokeSwap;