const express = require('express');
const router = express.Router();
const Web3 = require('web3');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const {User} = require('../../models/profile/user');
const {Swap, validateSwap} = require('../../models/profile/swap.model');
const Eth = require('../../app/web3/eth.main');

const auth = require('../../middleware/auth');
const Helper = require('../../common/helper');
const logger = Helper.getLogger('worker');
const EtherEvent = require('../event/ether.event')
const bridgeAbiJson = require('../../app/web3/bridge.swap.abi.json');

const provider = new Web3.providers.HttpProvider(process.env.ETHER_HTTP_PROVIDER);
const web3 = new Web3(provider);

let BridgeContractAddress = process.env.ETHER_BRIDGE_CONTRACT_ADDRESS;
let url = process.env.ETHER_WS_PROVIDER;

const etherEvent =  new EtherEvent(BridgeContractAddress, bridgeAbiJson, url);
etherEvent.listenEvent();
console.log(`worker Id: ${etherEvent.getEventId()}`);

const checkWeb3Connection = async ()=> {
    let status = await etherEvent.isConnected();
    console.log('connected: ', status);
    console.log(`worker Id: ${etherEvent.getEventId()}`);
    if (!status) {
        logger.error('Disconnected!')
        etherEvent.listenEvent();
      } else logger.info('Connected!')
}

setInterval(checkWeb3Connection, 35000)

router.get('/', async (req, res)  => {
    let status = await etherEvent.isConnected();
    console.log(`worker Id: ${etherEvent.getEventId()}`);
    console.log('connected: ', status)
    if (!status) {
        logger.error('Disconnected!')
        etherEvent
        etherEvent.listenEvent();
      } else logger.info('Connected!')

    
    logger.info(`worker Id: ${etherEvent.getEventId()}`);
    res.status(200).json({
        message: `worker Id: ${etherEvent.getEventId()}`,
        success: etherEvent.isConnected(),
        status: 200
    })
});

router.post('/swap-request/type/:swapType', auth, async (req, res) => {
    const { error } = validateSwap(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({ walletAddress: req.body.walletAddress});
    if (!user)
        return res.status(400).json({payload: 'Not existing wallet address, Please get certifate ', success: false, status: 400});

    let seed = web3.eth.abi.encodeParameters(['string', 'address'], [uuidv4(), req.body.walletAddress])
    let _key = web3.utils.sha3(seed, {encoding: 'hex'});
    let swapID = crypto.createHash('sha256').update(_key.slice(2, _key.length), 'hex').digest('hex');
    if (!swapID.includes('0x')) swapID = '0x' + swapID;
    const encoded = web3.eth.abi.encodeParameters(['bytes32', 'uint256', 'address'], [swapID, web3.utils.toWei(req.body.amount), req.body.walletAddress])
    const hash = web3.utils.sha3(encoded, {encoding: 'hex'})
    let hashed = await Eth.CreateSignature(hash, process.env.ADMIN_PRIVATE_KEY)

    try {
        if(req.params.swapType === 'CONtoCONX') {
           let swap = new Swap({
            swapType: req.params.swapType,
            wallet: user._id,
            amount: req.body.amount,
            swapID: swapID,
            swapKey: _key,
            messageHash: hashed.messageHash,
            signature: hashed.signature,
            eventId: etherEvent.eventId
           })

           let _swap = await swap.save()
           user.swaps.push(swap);
           await user.save();

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
                swapID: swapID,
                swapKey: _key,
                messageHash: hashed.messageHash,
                signature: hashed.signature,
                eventId: etherEvent.eventId
               })
    
               let _swap = await swap.save();     
               user.swaps.push(swap);
               await user.save();
                
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