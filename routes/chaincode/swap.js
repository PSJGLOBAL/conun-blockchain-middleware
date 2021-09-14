const express = require('express');
const router = express.Router();
const fork = require('child_process').fork;
const EtherEvent = fork(__dirname+'../../service/ether.event');

const Web3 = require('web3');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const config = require('config');
const {User} = require('../../models/profile/user');
const {Swap, validateSwap} = require('../../models/profile/swap.model');
const Eth = require('../../app/web3/eth.main');
const invokeHandler = require('../../app/invoke');
const queryHandler = require('../../app/query');
const auth = require('../../middleware/auth');
const events = require('events');
const Helper = require('../../common/helper');
const logger = Helper.getLogger('TokenAPI');

const provider = new Web3.providers.HttpProvider(config.get('ethereum.httpProvider'));
const web3 = new Web3(provider);

//
let BridgeContractAddress = config.get('ethereum.bridge_contract_address');
console.log('BridgeContractAddress: ', BridgeContractAddress);
let bridgeAbiJson = require('../../app/web3/bridge.swap.abi.json');
let url = config.get('ethereum.wsProvider');
console.log('url: ', url);

const etherEvent = new EtherEvent(BridgeContractAddress, bridgeAbiJson, url);

etherEvent.listenEvent();

function onExit() {
    EtherEvent.kill('SIGINT');
    process.exit(0);
}
process.on('exit', onExit);

EtherEvent.on('message', (res) => {
    console.log('ETHER-listener send >> :', res);
});
//

function CallInvoke(event, req) {
    const eventDeal = new events.EventEmitter();
    return new Promise(
        (resolve, reject) => {
            eventDeal.on('MintAndTransfer', async () => {
                let result = await invokeHandler.MintAndTransfer({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    id: req.body.id,
                    key: req.body.key,
                    walletAddress: req.body.walletAddress,
                    amount: req.body.amount,
                    messageHash: req.body.messageHash,
                    signature: req.body.signature
                });
                if(!result.status) reject(result.message);
                resolve(result.message);
            });

            eventDeal.on('BurnFrom', async () => {
                let result = await invokeHandler.BurnFrom({
                    channelName: req.params.channelName,
                    chainCodeName: req.params.chainCodeName,
                    fcn: req.body.fcn,
                    orgName: req.body.orgName,
                    walletAddress: req.body.walletAddress,
                    amount: req.body.amount,
                    messageHash: req.body.messageHash,
                    signature: req.body.signature
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

router.post('/channels/:channelName/chaincodes/:chainCodeName', auth, async (req, res) => {
    try {
        CallInvoke(req.body.fcn, req)
            .then((response) => {
                    res.status(200).json({
                            payload: response,
                            success: true,
                            status: 200
                        }
                    );
            }
        ).catch((error) => {
            logger.error(`Swap Post CallInvoke 1: Type: ${req.body.fcn} Reqeest: ${req.body} `, error);
            res.status(400).json({
                    payload: error,
                    success: false,
                    status: 400
                }
            );
        });
    } catch (error) {
        logger.error(`Swap Post CallInvoke 2: Type: ${req.body.fcn} Reqeest: ${req.body} `, error);
        res.status(400).json({
            payload: error.message,
            success: false,
            status: 400
        })
    }
});


// type con-conx, conx-con
router.post('/swap-request/type/:swapType', auth, async (req, res) => {
    // amount
    // walletAddress
    // return {id, key, messageHash, signature}
    const { error } = validateSwap(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({ walletAddress: req.body.walletAddress});
    if (!user)
        return res.status(400).json({payload: 'Not existing wallet address, Please get certifate ', success: false, status: 400});

    let seed = web3.eth.abi.encodeParameters(['string', 'address'], [uuidv4(), req.body.walletAddress])
    let _key = web3.utils.sha3(seed, {encoding: 'hex'});
    let withdrawId = crypto.createHash('sha256').update(_key.slice(2, _key.length), 'hex').digest('hex');
    if (!withdrawId.includes('0x')) withdrawId = '0x' + withdrawId;
    
    const encoded = web3.eth.abi.encodeParameters(['uint256', 'address'], [web3.utils.toWei(req.body.amount), req.body.walletAddress])
    console.log('encoded: ', encoded);
    const hash = web3.utils.sha3(encoded, {encoding: 'hex'})
    console.log('hash: ', hash);

    let hashed = await Eth.CreateSignature(hash, config.get('ethereum.adminPrivateKey'));
    console.log('messageHash: ', hashed.messageHash);
    console.log('signature: ', hashed.signature);
    console.log('\r\n');
    console.log('seed: ', seed);
    console.log('_key:', _key, web3.utils.isHex(_key));
    console.log('withdrawId: ', withdrawId, web3.utils.isHex(withdrawId))

    try {
        if(req.params.swapType === 'CONtoCONX') {
           let swap = new Swap({
            swapType: req.params.swapType,
            wallet: user._id,
            amount: req.body.amount,
            swapID: withdrawId,
            swapKey: _key,
            messageHash: hashed.messageHash,
            signature: hashed.signature
           })

           let _swap = await swap.save()
           console.log('_swap: ', _swap);

           user.swaps.push(swap);
           let _user = await user.save();
           console.log('_user: ', _user);

           res.status(200).json({
                payload: {
                    type: 'CONtoCONX',
                    amount: _swap.amount,
                    swapID: _swap.swapID
                },
                success: true,
                status: 200
            })
        }
        else if(req.params.swapType === 'CONXtoCON') {
            let swap = new Swap({
                swapType: req.params.swapType,
                wallet: user._id,
                amount: req.body.amount,
                swapID: withdrawId,
                swapKey: _key,
                messageHash: hashed.messageHash,
                signature: hashed.signature
               })
    
               let _swap = await swap.save()
               console.log('_swap: ', _swap);
    
               user.swaps.push(swap);
               let _user = await user.save();
               console.log('_user: ', _user);
    
               res.status(200).json({
                    payload: {
                        type: 'CONXtoCON',
                        amount: _swap.amount,
                        swapID: _swap.swapID,
                        swapKey: _swap.swapKey,
                        messageHash: _swap.messageHash,
                        signature: _swap.signature
                    },
                    success: true,
                    status: 200
                })
        }
    } catch (error) {
        logger.error(`Swap Post CallInvoke 3: Type: ${error.message} `, error);
        res.status(400).json({
            payload: error.message,
            success: false,
            status: 400
        })
    }
});



module.exports = router;