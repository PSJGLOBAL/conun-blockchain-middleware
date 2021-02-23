const {User, validate} = require('../../models/profile/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const helper = require('../../app/helper');
const auth = require('../../middleware/auth');

router.get('/me', auth, async (req, res) => {
    try {
        console.log('me >>  ');
        const user = await User.findById(req.user._id).select('-password');
        console.log('>> user', user)
        res.send(user);
    } catch (e) {
        console.log('me err: ', e)
    }
});

router.get('/', auth, async (req, res) => {
    const user = await User.find();
    res.send(user);
});

router.get('/check', async (req, res) => {
    const user = await User.findOne({email: req.query.email}).select('-password');
    if(!user) res.status(400).json({message: 'none', success: false,  status:  400 });
    res.status(200).json({message: user, success: true, status:  200  });
});

router.post('/idx', async (req, res) => {
    let user = await helper.getUserIdentity(req.body.wallet_address)
    console.log('USER: >>', user)
    res.status(200).json({ success: false, message: user });
});

router.post('/', async (req, res) => {
    console.log('req body: ', req.body)
    const { error } = validate(req.body);
    if (error)
        return res.status(400).send({error: error.details[0].message, status: 400});
    if (req.body.isAdmin)
        return res.status(400).send({error: '-', status: 400});
    let user = await User.findOne({ email: req.body.email });
    // if (user)
    //     return res.status(400).send({error: 'User already exist', status: 400});
    try {
        let wallet_address = req.body.wallet_address;
        let orgName = req.body.orgName;

        user = new User ({
            name: req.body.name,
            email: req.body.email,
            orgName: orgName,
            password: req.body.password,
            wallet_address: wallet_address,
            isAdmin:  req.body.isAdmin
        });
        console.log('>> user: ', user);
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        // await user.save()
        let response = await helper.getRegisteredUser(wallet_address, orgName, true);
        console.log('response from register: ', response)
        if (typeof response !== 'string') {
            res.status(201).send( _.pick(user, ['_id', 'name', 'email', 'wallet_address']));
        } else {
            res.status(400).json({ success: false, message: response });
        }
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
});

module.exports = router;