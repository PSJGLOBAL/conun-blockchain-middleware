const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { DID } = require('dids');
const {Ed25519Provider} = require('key-did-provider-ed25519')
const KeyResolver = require('key-did-resolver')
const {User, validateWalletSign} = require('../../models/profile/user');
const Helper = require('../../common/helper');
const logger = Helper.getLogger("profile/user");
const {randomBytes} = require('crypto');
const helper = require('../../app/helper/token.helper');
const Eth = require('../../app/web3/eth.main');
const u8a = require('../../utils/u8a.multiformats')
const auth = require('../../middleware/auth');

/*
req: {
  "orgName": "Org1",
  "walletType": "ETH",
  "walletAddress": "c430a0c91562cc363b4caab550f72ef55e1....a",
  "publicKey": "did:key:z6MkoaGmFcP1wsLCnVimtw3t1mZFuu9GqsRRNT4....r",
  "signHeader": {
    "messageHash": "0x2e996c3b0fa43b2f859c51dc9e1b603f512dfc58ea2b28d8927ec69ae...2",
    "signature": "0xaaec87c8f04e737e13d24855eeb3aeb1307652269712fe74d1148d7bd358b5705d131db93e9ab27830314709fdff3ce7005f71...b"
  }
}

res: {
    "payload": {
        "user": {
            "_id": "6299a5d53626d553862...",
            "walletAddress": "0xc430a0c91562cc363b4caab550f72ef55..."
        },
        "jwe": "{}"
    },
    "success": true,
    "status": 201
}
*/
router.post('/create-wallet', async (req, res) => {
    const { error } = validateWalletSign(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({walletAddress: req.body.walletAddress.toLowerCase()});
    if (user) 
        return res.status(400).json({payload: 'Wallet already exist', success: false, status: 400});
    try {
        let orgName = req.body.orgName;
        let signParam = {walletAddress: req.body.walletAddress, publicKey: req.body.publicKey}
        let hashMsg = Eth.HashMessage(JSON.stringify(signParam))
        if(hashMsg.toLowerCase() !== req.body.signHeader.messageHash.toLowerCase()) {
            return res.status(400).json({payload: 'Key Pair and sign error', success: false, status: 400});
        }    
        let signed = await Eth.VerifySignature(hashMsg, req.body.signHeader.signature);
        if(signed !== req.body.walletAddress) {
            return res.status(400).json({payload: 'Make sure you are adding right wallet address', success: false, status: 400});
        }

        let x509Identity = await helper.getRegisteredUser({
            orgName,
            walletType: req.body.walletType,
            walletAddress: req.body.walletAddress.toLowerCase()
        });

        const seed = randomBytes(32)
        const provider = new Ed25519Provider(seed)
        const did = new DID({ provider, resolver: KeyResolver.getResolver() })
        await did.authenticate()
        const jwe = await did.createDagJWS(x509Identity, req.body.publicKey)
        
        user = new User ({
            orgName: orgName,
            walletAddress: req.body.walletAddress.toLowerCase(),
            JWKeyStore: jwe,
            walletSignature: req.body.signHeader.signature,
            isAdmin: false
        });
        
        const salt = await bcrypt.genSalt();
        user.walletSignature = await bcrypt.hash(req.body.signHeader.signature, salt);

        if(x509Identity) await user.save();
        if (typeof x509Identity !== 'string') {
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'walletAddress']), jwe: JSON.stringify(jwe)}, success: true, status: 201})
        } else {
            logger.error('this is not type of certificate: ', {payload: x509Identity, success: false, status: 400})
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        logger.error(`/wallet-create: ${req.body.walletAddress} `, error);
        res.status(400).json({payload: `${req.body.walletAddress} user error: ${error}`, success: false, status: 400})
    }
});


/*
req: {
  "orgName": "Org1",
  "walletType": "ETH",
  "walletAddress": "c430a0c91562cc363b4caab550f72ef55e1....a",
  "publicKey": "did:key:z6MkoaGmFcP1wsLCnVimtw3t1mZFuu9GqsRRNT4....r",
  "signHeader": {
    "messageHash": "0x2e996c3b0fa43b2f859c51dc9e1b603f512dfc58ea2b28d8927ec69ae...2",
    "signature": "0xaaec87c8f04e737e13d24855eeb3aeb1307652269712fe74d1148d7bd358b5705d131db93e9ab27830314709fdff3ce7005f71...b"
  }
}

res: {
    "payload": {
        "user": {
            "_id": "6299a5d53626d5538626415c",
            "walletAddress": "0xc430a0c91562cc363b4caab550f72ef55e144457"
        },
        "jwe": "{}"
    },
    "success": true,
    "status": 201
}
*/
router.post('/import-wallet', async (req, res) => {
    try {
        console.log('/import-wallet ', req.body)
    const { error } = validateWalletSign(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({walletAddress: req.body.walletAddress.toLowerCase()});
    if (user) {
        let signParam = {walletAddress: req.body.walletAddress, publicKey: req.body.publicKey}
        let hashMsg = Eth.HashMessage(JSON.stringify(signParam))
        console.log('hashMsg: ', hashMsg)
        if(hashMsg.toLowerCase() !== req.body.signHeader.messageHash.toLowerCase()) {
            return res.status(400).json({payload: 'Key Pair and sign error', success: false, status: 400});
        }    
        let signed = await Eth.VerifySignature(hashMsg, req.body.signHeader.signature);
        console.log('signed: ', signed)
        if(signed !== req.body.walletAddress) {
            return res.status(400).json({payload: 'Make sure you are adding right wallet address', success: false, status: 400});
        }
        return  res.status(200).json({payload: {user: _.pick(user, ['_id', 'walletAddress']), jwe: JSON.stringify(user.JWKeyStore)}, success: true, status: 200})
    } else {
        let orgName = req.body.orgName;
        let signParam = {walletAddress: req.body.walletAddress, publicKey: req.body.publicKey}
        let hashMsg = Eth.HashMessage(JSON.stringify(signParam))
        if(hashMsg.toLowerCase() !== req.body.signHeader.messageHash.toLowerCase()) {
            return res.status(400).json({payload: 'Key Pair and sign error', success: false, status: 400});
        }    
        let signed = await Eth.VerifySignature(hashMsg, req.body.signHeader.signature);

        if(signed !== req.body.walletAddress) {
            return res.status(400).json({payload: 'Make sure you are adding right wallet address', success: false, status: 400});
        }
        let x509Identity = await helper.getRegisteredUser({
            orgName,
            walletType: req.body.walletType,
            walletAddress: req.body.walletAddress.toLowerCase()
        });

        const seed = randomBytes(32)
        const provider = new Ed25519Provider(seed)
        const did = new DID({ provider, resolver: KeyResolver.getResolver() })
        await did.authenticate()
        const jwe = await did.createDagJWS(x509Identity, req.body.publicKey)
        
        user = new User ({
            orgName: orgName,
            walletAddress: req.body.walletAddress.toLowerCase(),
            JWKeyStore: jwe,
            walletSignature: req.body.signHeader.signature,
            isAdmin: false
        });
        
        const salt = await bcrypt.genSalt();
        user.walletSignature = await bcrypt.hash(req.body.signHeader.signature, salt);

        if(x509Identity) await user.save();
        if (typeof x509Identity !== 'string') {
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'walletAddress']), jwe: JSON.stringify(jwe)}, success: true, status: 201})
        } else {
            logger.error('this is not type of certificate: ', {payload: x509Identity, success: false, status: 400})
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    }
} catch (error) {
    logger.error(`/wallet-create: ${req.body.walletAddress} `, error);
    res.status(400).json({payload: `${req.body.walletAddress} user error: ${error}`, success: false, status: 400})
}
});

/*
{
  "orgName": "Org1",
  "walletType": "ETH",
  "walletAddress": "c430a0c91562cc363b4caab550f72ef55e1....a",
  "publicKey": "did:key:z6MkoaGmFcP1wsLCnVimtw3t1mZFuu9GqsRRNT4....r",
  "signHeader": {
    "messageHash": "0x2e996c3b0fa43b2f859c51dc9e1b603f512dfc58ea2b28d8927ec69ae...2",
    "signature": "0xaaec87c8f04e737e13d24855eeb3aeb1307652269712fe74d1148d7bd358b5705d131db93e9ab27830314709fdff3ce7005f71...b"
  }
}
*/

//todo import-certificate
router.post('/import-certificate', async (req, res) => {
    const { error } = validateLinkedWallet(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 });
    let user = await User.findOne({walletAddress: req.user.walletAddress});
    if (!user)
        return res.status(400).json({payload: `wallet: ${req.user.walletAddress} is not exist`, success: false, status: 400});

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword)
        return res.status(400).json({payload: 'password is incorrect !', success: false, status: 400}) 

    try {
        let orgName = req.body.orgName;
        let payload = await helper.getLinkedWallets({
            orgName,
            password: req.body.password,
            walletType: req.body.walletType,
            walletAddress: req.body.x509Identity.walletAddress.toLowerCase(),
        });
        let verify = await Eth.VerifySignature(JSON.stringify(req.body.x509Identity), user.walletSignature);
        
        if (payload.walletAddress === verify.toLowerCase()) {
            res.status(200).json({payload:  payload, success: true, status: 200})
        } else {
            logger.error('1 - /getLinkedWallets error:', {payload: `certificate does not belongs to your account. owner is: ${verify}`, success: false, status: 400})
            res.status(400).json({payload: `certificate does not belongs to your account. owner is: ${verify}`, success: false, status: 400})
        }
    } catch (error) {
        logger.error(`2 - /getLinkedWallets error: ${error} `);
        res.status(400).json({payload: `${error.message}`, success: false, status: 400})
    }
});



module.exports = router;
