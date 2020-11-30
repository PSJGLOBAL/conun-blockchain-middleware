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

    let account = await web3Handlers.CreateAccountAdvanced(req.body.password);
        let encrypt  = {
            privateKey: crypto.AesEncrypt(account.privateKey, req.body.password),
            stringKeystore: crypto.AesEncrypt(account.stringKeystore, req.body.password),
        }
        console.log('account: ', account);
        console.log('encrypt: ', encrypt);
        console.log('req.body: ', req.body);
        user = new User ({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            isAdmin:  req.body.isAdmin,
            wallet_address: account.wallet_address,
            privateKey: encrypt.privateKey,
            stringKeystore: encrypt.stringKeystore
        });

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    await user.save()
    res.send( _.pick(user, ['_id', 'name', 'email', 'wallet_address']));

});

module.exports = router;