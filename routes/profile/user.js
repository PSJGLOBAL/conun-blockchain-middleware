const express = require('express');
const router = express.Router();
const {User, validate} = require('../../models/profile/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Helper = require('../../common/helper');
const _logger = Helper.getLogger("UserAPI");

const helper = require('../../app/helper/token.helper');
const auth = require('../../middleware/auth');
const owner = require('../../middleware/owner');
const web3Handlers = require('../../app/web3/eth.main');


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

router.post('/create', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })
    let user = await User.findOne({ email: req.body.email });
    if (user)
        return res.status(400).json({payload: 'User already exist', success: false, status: 400});
    try {
        let orgName = req.body.orgName;

        const account = await web3Handlers.CreateAccountAdvanced(req.body.password);

        user = new User ({
            name: req.body.name,
            email: req.body.email,
            orgName: orgName,
            password: req.body.password,
            walletType: req.body.walletType,
            walletAddress: account.walletAddress,
            isAdmin: false
        });
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        let x509Identity = await helper.getRegisteredUser({
            walletAddress: account.walletAddress,
            orgName,
            walletType: req.body.walletType,
            keyStore: account.stringKeystore,
            password: req.body.password
        });
        if(x509Identity) await user.save();
        if (typeof x509Identity !== 'string') {
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']), x509Identity}, success: true, status: 201})
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        _logger.error(`/create email: ${req.body.email} `, error);
        res.status(400).json({payload: `${req.body.email} user error`, success: false, status: 400})
    }
});

router.post('/importEthPk', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 });
    let user = await User.findOne({ email: req.body.email });
    if (user)
        return res.status(400).json({payload: 'User already exist', success: false, status: 400});
    try {
        let orgName = req.body.orgName;
        const account = await web3Handlers.ImportAccountByPrivateKey(req.body.privateKey, req.body.password);

        let wallet = await User.findOne({ walletAddress: account.walletAddress });
        if (wallet)
            return res.status(400).json(
                {
                    payload: `User with this wallet address ${account.walletAddress} already exist, please import your wallet and try again`,
                    success: false,
                    status: 400
                });

        user = new User({
            name: req.body.name,
            email: req.body.email,
            orgName: orgName,
            password: req.body.password,
            walletType: req.body.walletType,
            walletAddress: account.walletAddress,
            isAdmin: false
        });
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        let x509Identity = await helper.getRegisteredUser({
            walletAddress: account.walletAddress,
            orgName,
            walletType: req.body.walletType,
            keyStore: account.stringKeystore,
            password: req.body.password
        });

        if(x509Identity) await user.save();
        if (typeof x509Identity !== 'string') {
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']), x509Identity}, success: true, status: 201})
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        _logger.error(`/importEthPk error: ${error} `);
        res.status(400).json({payload: `wallet error, ${error.message}`, success: false, status: 400})
    }
});

router.post('/importWallet', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 });
    let user = await User.findOne({ email: req.body.email, walletAddress: req.body.x509Identity.walletAddress });
    if (!user)
        return res.status(400).json({payload: `User with this email: ${req.body.email} or wallet: ${req.body.walletAddress} is not belongs to you`, success: false, status: 400});
    try {
        let orgName = req.body.orgName;

        let x509Identity = await helper.importUserByWallet({
            orgName,
            password: req.body.password,
            walletType: req.body.walletType,
            walletAddress: req.body.x509Identity.walletAddress,
            x509Identity: req.body.x509Identity,
        });

        if (typeof x509Identity !== 'string') {
            res.status(200).json({payload:  x509Identity, success: true, status: 200})
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        _logger.error(`/importWallet error: ${error} `);
        res.status(400).json({payload: `duplicate user or ${error.message}`, success: false, status: 400})
    }
});

module.exports = router;
