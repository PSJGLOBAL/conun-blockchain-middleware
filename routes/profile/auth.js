const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const {User} = require('../../models/profile/user');
const router = express.Router();

router.post('/', async (req, res) => {
    console.log('req.body: ', req.body)
    const { error } = validate(req.body);
    if (error)
        return res.status(400).json({payload: error.details[0].message, success: false, status: 400 })

    let user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).json({payload: 'Email or password is incorrect !', success: false, status: 400})

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword)
        return res.status(400).json({payload: 'Email or password is incorrect !', success: false, status: 400})
    const token = user.generateAuthToken(req.body.key);
    res.status(200).header('x-auth-token', token).json({
        payload: {
            'x-auth-token': token,
            user: _.pick(user, ['_id', 'name', 'email', 'wallet_address'])
        },
        success: false,
        status: 200
    });
});

function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required()
    });
    return schema.validate(req);
}

module.exports = router;
