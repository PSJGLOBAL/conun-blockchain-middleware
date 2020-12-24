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
        return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user)
        return res.status(400).send({error: 'Email or password is incorrect !', status: 400});

    let update = await User.findByIdAndUpdate(user._id, {key: req.body.key});
    console.log('update: ', update);
    if (!update)
        return res.status(400).send({error: 'Email or password is incorrect !', status: 400});

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if(!isValidPassword)
        return res.status(400).send({error: 'Email or password is incorrect !', status: 400});
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send({
        'x-auth-token': token,
        user: _.pick(user, ['_id', 'name', 'email', 'wallet_address'])
    });
});

function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required(),
        key: Joi.string().min(3).max(2048).required(),
    });
    return schema.validate(req);
}

module.exports = router;