const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const _ = require('lodash');
const auth = require('../../middleware/auth');
const {User, validate} = require('../../models/profile/user');
const helper = require('../../app/helper');

router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({message: user, success: true, status: 200})
    } catch (e) {
        res.status(400).json({message: e.message, success: false, status: 400 })
    }
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).json({message: error.details[0].message, success: false, status: 400 })
    if (!req.body.isAdmin)
        return res.status(400).json({message: '-', success: false, status: 400 })
    let user = await User.findOne({ email: req.body.email });
    if (user)
        return res.status(400).json({message: 'User already exist', success: false, status: 400});
    try {
        var wallet_address = req.body.wallet_address;
        var orgName = req.body.orgName;

        user = new User ({
            name: req.body.name,
            email: req.body.email,
            orgName: orgName,
            password: req.body.password,
            walletType: req.body.walletType,
            wallet_address: wallet_address,
            isAdmin:  req.body.isAdmin
        });
        console.log('>> user: ', user);
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);
        let response = await helper.getRegisteredUser({
            wallet_address,
            orgName,
            walletType: req.body.walletType,
            privateKey: req.body.privateKey,
            password: req.body.password
        });
        console.log('response from register: ', response)
        await user.save()

        if (typeof response !== 'string') {
            res.status(201).json({message:  _.pick(user, ['_id', 'name', 'email', 'wallet_address']), success: true, status: 201})
        } else {
            res.status(400).json({message: response, success: false, status: 400})
        }
    } catch (e) {
        res.status(400).json({message: `${req.body.email} duplicate user error`, success: false, status: 400})
    }
});

module.exports = router;