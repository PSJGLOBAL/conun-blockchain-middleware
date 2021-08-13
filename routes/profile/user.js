const express = require('express');
const router = express.Router();
const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const NodeRSA = require('node-rsa');

const rsaToken =  require('../../middleware/crypto/rsa-signature/index');
const {User, validateMember, validateNoneMember, validateAuthLogin, 
    validateWalletLogin, validateWalletImport, validateLinkedWallet} = require('../../models/profile/user');
const { Wallet } = require('../../models/profile/wallet');
const Helper = require('../../common/helper');
const _logger = Helper.getLogger("UserAPI");

const helper = require('../../app/helper/token.helper');
const auth = require('../../middleware/auth');
const oauth = require('../../middleware/email.oauth');
const rsaVerify = require('../../middleware/rsa.auth');
const Eth = require('../../app/web3/eth.main');
const crypto = require('../../utils/crypto/encryption.algorithm');

router.get('/check', async (req, res) => {
    try {
        const user = await User.findOne({email: req.query.email}).select('-password');
        console.log('user: ', user);
        res.status(200).json({payload: user.email, success: true, status:  200  });
    } catch (error) {
        _logger.error(`/check: Reqeest: ${req.query} `, error);
        res.status(400).json({payload: error.message, success: false,  status:  400 });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({payload: user, success: true, status: 200})
    } catch (error) {
        _logger.error(`/me: Reqeest: ${req.user._id} `, error);
        res.status(400).json({payload: error.message, success: false, status: 400 })
    }
});

router.get('/checkKey', auth, async (req, res) => {
    try {
        let user = await helper.getUserIdentity({
            orgName: req.query.orgName,
            walletAddress: req.user.walletAddress,
            walletType: req.query.walletType,
            password: req.query.password
        });
        if (user) {
            res.status(200).json({payload: user, success: true, status: 200})
        } else {
            res.status(400).json({payload: user, success: false, status: 400})
        }
    } catch (error) {
        _logger.error(`/checkKey check your wallet: ${req.user.walletAddress} `, error);
        res.status(400).json({payload: `check your wallet: ${req.user.walletAddress} password or ${error.message}`, success: false, status: 400 })
    }
});


//done
router.post('/auth-create', oauth,  async (req, res) => {
    const { error } = validateMember(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({ email: req.body.email });
    if (user)
        return res.status(400).json({payload: 'User already exist', success: false, status: 400});
    try {
        let orgName = req.body.orgName;
        let decryptData = await Eth.keyStoreDecrypt(req.body.keyStore, req.body.password);
        console.log('decryptData.privateKey: ', decryptData.privateKey);
        let x509Identity = await helper.getRegisteredUser({
            orgName,
            walletType: req.body.walletType,
            walletAddress: req.body.walletAddress,
            keyStore: req.body.keyStore,
            password: req.body.password
        });

        console.log('x509Identity: ', x509Identity);

        let hashed = await Eth.CreateSignature(JSON.stringify(x509Identity), decryptData.privateKey)
        console.log('walletSignature: ', hashed.signature)

        user = new User ({
            name: req.body.name,
            email: req.body.email,
            orgName: orgName,
            password: req.body.password,
            walletAddress: req.body.walletAddress,
            x509keyStore: crypto.AesEncrypt(JSON.stringify(x509Identity), req.body.password),
            walletSignature: hashed.signature,
            isAdmin: false
        });
        console.log('User DB save: ', user);
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        if(x509Identity) await user.save();
        if (typeof x509Identity !== 'string') {
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']), x509Identity}, success: true, status: 201})
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        _logger.error(`/create email: ${req.body.walletAddress} `, error);
        res.status(400).json({payload: `${req.body.walletAddress} user error: ${error}`, success: false, status: 400})
    }
});


//done
router.post('/wallet-create', async (req, res) => {
    const { error } = validateNoneMember(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({walletAddress: req.body.walletAddress});
    console.log('user: ', user);
    if (user)
        return res.status(400).json({payload: 'Wallet already exist', success: false, status: 400});
    try {
        let orgName = req.body.orgName;
        let decryptData = await Eth.keyStoreDecrypt(req.body.keyStore, req.body.password);
        console.log('decryptData.privateKey: ', decryptData.privateKey);
        let x509Identity = await helper.getRegisteredUser({
            orgName,
            walletType: req.body.walletType,
            walletAddress: req.body.walletAddress,
            keyStore: req.body.keyStore,
            password: req.body.password
        });
        console.log('x509Identity: ', x509Identity);

        let hashed = await Eth.CreateSignature(JSON.stringify(x509Identity), decryptData.privateKey)
        console.log('walletSignature: ', hashed.signature)
        
        user = new User ({
            orgName: orgName,
            password: req.body.password,
            walletAddress: req.body.walletAddress,
            walletSignature: hashed.signature,
            isAdmin: false
        });

        console.log('User DB save: ', user);
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        if(x509Identity) await user.save();
        if (typeof x509Identity !== 'string') {
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'walletAddress']), x509Identity}, success: true, status: 201})
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        _logger.error(`/create email: ${req.body.walletAddress} `, error);
        res.status(400).json({payload: `${req.body.walletAddress} user error: ${error}`, success: false, status: 400})
    }
});


//done
router.post('/auth-login', oauth, async (req, res) => {
    console.log('req.body: ', req.body)
    const { error } = validateAuthLogin(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })

    let user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).json({payload: 'Email or password is incorrect !', success: false, status: 400})

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword)
        return res.status(400).json({payload: 'Email or password is incorrect !', success: false, status: 400})

    const key = new NodeRSA({b:1024});

    let publicKey = key.exportKey('public');
    let privateKey = key.exportKey('private');
    console.log('publicKey: ', publicKey);
    console.log('privateKey: ', privateKey);
    const token = user.generateAuthToken(publicKey);
    res.status(200).header('jwtAuthToken', token).json({
        payload: {
            user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']),
            'jwtAuthToken': token,
            rsa: {
                'privateKey': privateKey,
                'publicKey': publicKey
            },
            x509Identity: JSON.parse(crypto.AESDecrypt(user.x509keyStore, req.body.password))
        },
        success: true,
        status: 200
    });
});

//done
router.post('/importCertificate', async (req, res) => {
    const { error } = validateWalletImport(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 });
    let user = await User.findOne({ walletAddress: req.body.x509Identity.walletAddress });
    if (!user)
        return res.status(400).json({payload: `wallet: ${req.body.x509Identity.walletAddress} is not exist`, success: false, status: 400});

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword)
        return res.status(400).json({payload: 'password is incorrect !', success: false, status: 400})

    try {
        const key = new NodeRSA({b:1024});

        let publicKey = key.exportKey('public');
        let privateKey = key.exportKey('private');
        console.log('publicKey: ', publicKey);
        console.log('privateKey: ', privateKey);
        const token = user.generateAuthToken(publicKey);
        let orgName = req.body.orgName;
        let walletAddress = await helper.importWalletByCertificate({
            orgName,
            password: req.body.password,
            walletAddress: req.body.x509Identity.walletAddress,
            x509Identity: req.body.x509Identity,
        });
        console.log('walletAddress: ', walletAddress);
        if (walletAddress) {
            res.status(200).header('jwtAuthToken', token).json({
                payload: {
                    user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']),
                    'jwtAuthToken': token,
                    rsa: {
                        'privateKey': privateKey,
                        'publicKey': publicKey
                    },
                    x509Identity: req.body.x509Identity
                },
                success: true,
                status: 200
            });
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        console.log(`/importWalletByCertificate error: ${error} `);
        _logger.error(`/importWalletByCertificate error: ${error} `);
        res.status(400).json({payload: `duplicate user or ${error.message}`, success: false, status: 400})
    }
});


//todo auth and sign
router.post('/getLinkedWallets', auth, rsaVerify, async (req, res) => {
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

        let walletAddress = await helper.getLinkedWallets({
            orgName,
            password: req.body.password,
            walletType: req.body.walletType,
            walletAddress: req.user.walletAddress,
        });
        if (walletAddress) {
            res.status(200).json({payload:  walletAddress, success: true, status: 200})
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        console.log(`/getLinkedWallets error: ${error} `);
        _logger.error(`/getLinkedWallets error: ${error} `);
        res.status(400).json({payload: `${error.message}`, success: false, status: 400})
    }
});

module.exports = router;
