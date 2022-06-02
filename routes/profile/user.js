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


//todo Unit8Array to base64
//base64 to Unit8Array
router.post('/wallet-sign', async (req, res) => {
    console.log('req.body: ', req.body);
    const { error } = validateWalletSign(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({walletAddress: req.body.walletAddress.toLowerCase()});
    if (user)
        return res.status(400).json({payload: 'Wallet already exist', success: false, status: 400});
    try {
        let orgName = req.body.orgName;
        let signed = await Eth.VerifySignature(req.body.sign.sig.signature, req.body.sign.hash, req.body.walletAddress);
        console.log('signed: ', signed)
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
        console.log('jwe: ', jwe)
        const jws = await did.createJWS({ hello: 'world' })
        const status = await did.verifyJWS(jws)
        console.log('jws: ', jws)
        console.log('status: ', status)

        // user = new User ({
        //     orgName: orgName,
        //     password: req.body.password,
        //     walletAddress: req.body.walletAddress.toLowerCase(),
        //     walletSignature: hashed.signature,
        //     isAdmin: false
        // });
        
        // const salt = await bcrypt.genSalt();
        // user.password = await bcrypt.hash(user.password, salt);

        // if(x509Identity) await user.save();
        if (typeof x509Identity !== 'string') {
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'walletAddress']), x509Identity}, success: true, status: 201})
        } else {
            logger.error('this is not type of certificate: ', {payload: x509Identity, success: false, status: 400})
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        logger.error(`/wallet-create: ${req.body.walletAddress} `, error);
        res.status(400).json({payload: `${req.body.walletAddress} user error: ${error}`, success: false, status: 400})
    }
});

module.exports = router;
