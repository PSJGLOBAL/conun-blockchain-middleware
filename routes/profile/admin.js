const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const _ = require('lodash');
const oauth = require('../../middleware/email.oauth');
const {User, validateMember, validateAuthLogin} = require('../../models/profile/user');
const helper = require('../../app/helper/token.helper');
const Eth = require('../../app/web3/eth.main');
const crypto = require('../../utils/crypto/encryption.algorithm');
const Helper = require('../../common/helper');
const logger = Helper.getLogger("profile/admin");


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
        let x509Identity = await helper.getRegisteredUser({
            orgName,
            walletType: req.body.walletType,
            walletAddress: req.body.walletAddress.toLowerCase(),
            keyStore: req.body.keyStore,
            password: req.body.password
        });

        let hashed = await Eth.CreateSignature(JSON.stringify(x509Identity), decryptData.privateKey)
        user = new User ({
            name: req.body.name,
            email: req.body.email,
            orgName: orgName,
            password: req.body.password,
            walletAddress: req.body.walletAddress.toLowerCase(),
            x509keyStore: crypto.AesEncrypt(JSON.stringify(x509Identity), req.body.password),
            walletSignature: hashed.signature,
            isAdmin: true
        });
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(user.password, salt);

        if(x509Identity) await user.save();
        if (typeof x509Identity !== 'string') {
            res.status(201).json({payload: {user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']), x509Identity}, success: true, status: 201})
        } else {
            res.status(400).json({payload: x509Identity, success: false, status: 400})
        }
    } catch (error) {
        logger.error(`/create email: ${req.body.walletAddress} `, error);
        res.status(400).json({payload: `${req.body.walletAddress} user error: ${error}`, success: false, status: 400})
    }
});

router.post('/auth-login', oauth, async (req, res) => {
    const { error } = validateAuthLogin(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })

    let user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).json({payload: 'Email or password is incorrect !', success: false, status: 400})
    if (!user.isAdmin)
        return res.status(400).json({payload: 'Not Admin role', success: false, status: 400})

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword)
        return res.status(400).json({payload: 'Email or password is incorrect !', success: false, status: 400})

    const token = user.generateAuthToken();
    res.status(200).header('jwtAuthToken', token).json({
        payload: {
            user: _.pick(user, ['_id', 'name', 'email', 'walletAddress']),
            'jwtAuthToken': token,
            x509Identity: JSON.parse(crypto.AESDecrypt(user.x509keyStore, req.body.password))
        },
        success: true,
        status: 200
    });
});


module.exports = router;
