const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const _ = require('lodash');
const auth = require('../../middleware/auth');
const {User, validate} = require('../../models/profile/user');
const helper = require('../../app/helper');

router.get('/me', auth, async (req, res) => {
        const user = await User.findById(req.user._id).select('-password');
        res.send(user);
});

router.get('/', auth, async (req, res) => {
    const user = await User.find({isAdmin: true});
    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).send({error: error.details[0].message, status: 400});
    if (!req.body.isAdmin)
        return res.status(400).send({error: '-', status: 400});
    let user = await User.findOne({ email: req.body.email });
    if (user)
        return res.status(400).send({error: 'User already exist', status: 400});
    try {
        var wallet_address = req.body.wallet_address;
        var orgName = req.body.orgName;

        user = new User ({
            name: req.body.name,
            email: req.body.email,
            orgName: orgName,
            password: req.body.password,
            wallet_address: wallet_address,
            isAdmin: req.body.isAdmin
        });
        console.log('>> user: ', user);
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        await user.save()

        let response = await helper.getRegisteredUser(wallet_address, orgName, true);
        if (typeof response !== 'string') {
            res.send( _.pick(user, ['_id', 'name', 'email', 'wallet_address'])).status(201);
        } else {
            // logger.debug('Failed to register the wallet_address %s for organization %s with::%s', wallet_address, orgName, response);
            res.json({ success: false, message: response }).status(400);
        }
    } catch (e) {
        res.json({ success: false, message: 'error while admin creation' }).status(400);
    }
});

module.exports = router;