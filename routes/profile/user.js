const {User, validate} = require('../../models/profile/user');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const _ = require('lodash');
const web3Handlers = require('../../web3/eth.main');
const crypto = require('../../utils/crypto/encryption.algorithm');
const auth = require('../../middleware/auth');

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.get('/', auth, async (req, res) => {
    const user = await User.find();
    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user)
        return res.status(400).send('User already exist');

    const account = await web3Handlers.CreateAccountAdvanced(req.body.password);

    let encrypt  = {
        privateKey: crypto.AesEncrypt(account.privateKey, req.body.password),
        stringKeystore: crypto.AesEncrypt(account.stringKeystore, req.body.password),
    }
    console.log('encrypt: ', encrypt);
    user = new User(_.pick(req.body, ['name', 'email', 'password', 'isAdmin']),
                    account.wallet_address, encrypt.privateKey, encrypt.stringKeystore);
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();
    res.send(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;