const {User, validate} = require('../../models/profile/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const helper = require('../../app/helper');
const auth = require('../../middleware/auth');
const owner = require('../../middleware/auth');
const web3Handlers = require('../../app/web3/eth.main');

router.get('/me', auth, owner, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({payload: user, success: true, status: 200})
    } catch (e) {
        res.status(400).json({payload: e.message, success: false, status: 400 })
    }
});

router.get('/checkKey', auth, owner, async (req, res) => {
    let user = await helper.getUserIdentity({
        wallet_address: req.query.wallet_address,
        walletType: req.query.walletType,
        password: req.query.password
    })
    console.log('user', user)
    res.status(200).json({payload: user, success: true, status: 200})
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
        console.log('>> user: ', user);
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        let response = await helper.getRegisteredUser({
            walletAddress: account.walletAddress,
            orgName,
            walletType: req.body.walletType,
            privateKey: account.stringKeystore,
            password: req.body.password
        });
        console.log('response from register: ', response);

        await user.save()

        if (typeof response !== 'string') {
            res.status(201).json({payload:  _.pick(user, ['_id', 'name', 'email', 'wallet_address']), success: true, status: 201})
        } else {
            res.status(400).json({payload: response, success: false, status: 400})
        }
    } catch (e) {
        res.status(400).json({payload: `${req.body.email} duplicate user error`, success: false, status: 400})
    }
});


router.post('/import', async (req, res) => {
    // TODO import existing wallet
})

module.exports = router;
