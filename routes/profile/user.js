"use strict";
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const JoseJwe  = require('../../utils/crypto/jose.encryption')
const {User, validateWalletSign} = require('../../models/profile/user');
const Helper = require('../../common/helper');
const logger = Helper.getLogger("profile/user");
const {randomBytes} = require('crypto');
const helper = require('../../app/helper/token.helper');
const Eth = require('../../app/web3/eth.main');
const u8a = require('../../utils/u8a.multiformats')
const auth = require('../../middleware/auth');
const { DID } = require('conun-dids')
const { Ed25519Provider } = require('key-did-provider-ed25519')
const KeyResolver = require('key-did-resolver').default

router.post('/create-wallet', async (req, res) => {
    const { error } = validateWalletSign(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({walletAddress: req.body.walletAddress.toLowerCase()});
    if (user) 
        return res.status(400).json({payload: 'Wallet already exist', success: false, status: 400});
    try {
        let orgName = req.body.orgName;

        let signed = await Eth.VerifySignature(req.body.rootHash, req.body.signHeader.signature);
        if(signed !== req.body.walletAddress) {
            return res.status(400).json({payload: 'Make sure you are adding right wallet address', success: false, status: 400});
        }

        let x509Identity = await helper.getRegisteredUser({
            orgName,
            walletType: req.body.walletType,
            walletAddress: req.body.walletAddress.toLowerCase()
        });

        const provider = new Ed25519Provider(Buffer.from(process.env.ADMIN_PRIVATE_KEY, 'hex'))
        const did = new DID({ provider, resolver: KeyResolver.getResolver()})
        await did.authenticate()
        const jwe = await did.createDagJWE(x509Identity, [req.body.publicKey])

        const encryptedToken = await new JoseJwe()
            .setSecretKey({
                secretKey: new Uint8Array(Buffer.from(req.body.rootHash, 'hex')),
                issuer: req.body.publicKey,
                audience: req.body.publicKey
            })
            .signEncrypt(jwe)
        
        user = new User ({
            orgName: orgName,
            walletAddress: req.body.walletAddress.toLowerCase(),
            JWKeyStore: jwe,
            isAdmin: false
        });

        if(x509Identity) await user.save();
        if (typeof x509Identity !== 'string') {
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'walletAddress']), encryptedToken, basePublicKey: did.id}, success: true, status: 201})
        } else {
            logger.error('this is not type of certificate: ', {payload: x509Identity, success: false, status: 400})
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        console.log(`/wallet-create: ${req.body.walletAddress}`, error);
        logger.error(`/wallet-create: ${req.body.walletAddress} `, error);
        res.status(400).json({payload: `${req.body.walletAddress} user error: ${error}`, success: false, status: 400})
    }
});


router.post('/login-wallet', async (req, res) => {
    const { error } = validateLogin(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })

    let user = await User.findOne({ walletAddress: req.body.walletAddress });
    if (!user)
        return res.status(400).json({payload: `Wallet: ${req.body.walletAddress} is not exist!`, success: false, status: 400})


    const provider = new Ed25519Provider(Buffer.from(process.env.ADMIN_PRIVATE_KEY, 'hex'))
    const did = new DID({ provider, resolver: KeyResolver.getResolver()})
    await did.authenticate()
    const dec = await did.decryptDagJWE(req.body.encryptedParam)

    let signed = await Eth.VerifySignature({rootHash: dec.rootHash, publicKey: req.body.publicKey}, dec.signHeader.signature);
    if(signed !== req.body.walletAddress) {
        return res.status(400).json({payload: 'Make sure you are adding right wallet address', success: false, status: 400});
    }

    const token = user.generateAuthToken(walletSignature);
    res.status(200).header('jwtAuthToken', token).json({
        payload: {
            user: _.pick(user, ['_id', 'walletAddress', 'orgName']),
            'jwtAuthToken': token
        },
        success: true,
        status: 200
    });
});


module.exports = router;
