const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');

const {User, validateMember, validateNoneMember, validateAuthLogin, 
      validateWalletImport, validateLinkedWallet} = require('../../../../models/profile/user');
const Helper = require('../../../../common/helper');
const _logger = Helper.getLogger("UserAPI");

const helper = require('../../../../app/helper/token.helper');
const Eth = require('../../../../app/web3/eth.main');
const crypto = require('../../../../utils/crypto/encryption.algorithm');

router.get('/getConfig', async (req, res) => {
    try {
        let conContractAddrress = process.env.ETHER_CON_CONTRACT_ADDRESS;
        let bridgeContractAddrress = process.env.ETHER_BRIDGE_CONTRACT_ADDRESS;
        let conABI = require('../../app/web3/abi.json');
        let bridgeABI = require('../../app/web3/bridge.swap.abi.json');
        res.status(200).json({payload: {
            conContract: {
                address: conContractAddrress,
                abiRaw: conABI
            },
            bridgeContract: {
                address: bridgeContractAddrress,
                abiRaw: bridgeABI
            },

        }, success: true, status: 200})
    } catch (error) {
        _logger.error(`/me: Reqeest: `, error);
        res.status(400).json({payload: error.message, success: false, status: 400 })
    }
});

router.get('/check', async (req, res) => {
    try {
        if(req.query.email) {
            let user = await User.findOne({email: req.query.email}).select(['-password', '-x509keyStore', '-walletSignature']);
            console.log('user: ', user);
            res.status(200).json({payload: user.email, success: true, status:  200  });
        }
        else if(req.query.walletAddress) {
            let user = await User.findOne({walletAddress: req.query.walletAddress}).select(['-password', '-x509keyStore', '-walletSignature']);
            console.log('user: ', user);
            res.status(200).json({payload: user.walletAddress, success: true, status:  200 });
        }
    } catch (error) {
        console.log('/check: ', error)
        _logger.error(`/check: Reqeest: ${req.query} `, error);
        res.status(400).json({payload: error.message, success: false,  status:  400 });
    }
});

router.get('/me', async (req, res) => {
    try {
        const user = await User.findById(req.body.user._id).select(['-password', '-x509keyStore', '-walletSignature']);
        res.status(200).json({payload: user, success: true, status: 200})
    } catch (error) {
        _logger.error(`/me: Reqeest: ${req.body.user._id} `, error);
        res.status(400).json({payload: error.message, success: false, status: 400 })
    }
});


router.post('/wallet-create', async (req, res) => {
    const { error } = validateNoneMember(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({walletAddress: req.body.walletAddress.toLowerCase()});
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
            walletAddress: req.body.walletAddress.toLowerCase(),
            keyStore: req.body.keyStore,
            password: req.body.password
        });
        // console.log('x509Identity: ', x509Identity);

        let hashed = await Eth.CreateSignature(JSON.stringify(x509Identity), decryptData.privateKey);
        console.log('walletSignature: ', hashed.signature)
        
        user = new User ({
            orgName: orgName,
            password: req.body.password,
            walletAddress: req.body.walletAddress.toLowerCase(),
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


router.post('/importCertificate', async (req, res) => {
    console.log('importCertificate:', req.body);
    const { error } = validateWalletImport(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 });
    let user = await User.findOne({ walletAddress: req.body.x509Identity.walletAddress.toLowerCase() });
    if (!user)
        return res.status(400).json({payload: `wallet: ${req.body.x509Identity.walletAddress} is not exist`, success: false, status: 400});

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword)
        return res.status(400).json({payload: 'password is incorrect !', success: false, status: 400})

    try {
        const token = user.generateAuthToken();
        let walletAddress = await helper.importWalletByCertificate({
            orgName: req.body.orgName,
            password: req.body.password,
            walletAddress: req.body.x509Identity.walletAddress.toLowerCase(),
            x509Identity: req.body.x509Identity,
        });
        console.log('walletAddress: ', walletAddress, token);
        if (walletAddress) {
            res.status(200).header('jwtAuthToken', token).json({
                payload: {
                    user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']),
                    'jwtAuthToken': token
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


router.post('/retryImportCertificate', async (req, res) => {
    console.log('importCertificate:', req.body);
    const { error } = validateWalletImport(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 });
    let wallet = await User.findOne({walletAddress: req.body.x509Identity.walletAddress.toLowerCase() });
    console.log('wallet: ', wallet);
    if (wallet)
        return res.status(400).json({payload: 'Wallet already exist', success: false, status: 400});

    try {
        let payload = await helper.getLinkedWallets({
            orgName: req.body.orgName,
            password: req.body.password,
            walletType: 'ETH',
            walletAddress: req.body.x509Identity.walletAddress.toLowerCase(),
            x509Identity: req.body.x509Identity
        });
        console.log('payload: ', payload);
        let decryptData = await Eth.keyStoreDecrypt(payload.keyStore, req.body.password);
        console.log('decryptData.privateKey: ', decryptData.privateKey);
        let hashed = await Eth.CreateSignature(JSON.stringify(req.body.x509Identity), decryptData.privateKey);
        console.log('walletSignature: ', hashed.signature)
        let user = new User ({
            orgName: req.body.orgName,
            password: req.body.password,
            walletAddress: req.body.x509Identity.walletAddress.toLowerCase(), 
            walletSignature: hashed.signature,
            isAdmin: false
        });
    
        console.log('User DB save: ', user);
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();  
        const token = user.generateAuthToken();
        let walletAddress = await helper.importWalletByCertificate({
            orgName: req.body.orgName,
            password: req.body.password,
            walletAddress: req.body.x509Identity.walletAddress.toLowerCase(),
            x509Identity: req.body.x509Identity,
        });
        console.log('walletAddress: ', walletAddress, token);
        if (walletAddress) {
            res.status(200).header('jwtAuthToken', token).json({
                payload: {
                    user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']),
                    'jwtAuthToken': token
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


router.post('/getLinkedWallets', async (req, res) => {
    console.log('getLinkedWallets: ', req.body)
    const { error } = validateLinkedWallet(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 });
    let user = await User.findOne({walletAddress: req.body.walletAddress});
    console.log('user db - 1: ', user)
    if (!user)
        return res.status(400).json({payload: `wallet: ${req.body.walletAddress} is not exist`, success: false, status: 400});

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
        // data, signature
        let verify = await Eth.VerifySignature(JSON.stringify(req.body.x509Identity), user.walletSignature);
        console.log('walletAddress', user.walletAddress)
        console.log('walletverify: ', verify)   

        if (payload.walletAddress === verify.toLowerCase()) {
            res.status(200).json({payload:  payload, success: true, status: 200})
        } else {
            res.status(400).json({payload: `certificate does not belongs to your account. owner is: ${verify}`, success: false, status: 400})
        }
    } catch (error) {
        console.log(`/getLinkedWallets error: ${error} `);
        _logger.error(`/getLinkedWallets error: ${error} `);
        res.status(400).json({payload: `${error.message}`, success: false, status: 400})
    }
});

module.exports = router;
