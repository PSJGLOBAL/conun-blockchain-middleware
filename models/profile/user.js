const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 100,
    },
    orgName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    walletType: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
    },
    walletAddress: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 1024,
    },
    isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({_id: this._id, isAdmin: this.isAdmin, walletAddress: this.walletAddress}, config.get('jwtPrivateKey'), { expiresIn: '365d' });
}

const User = mongoose.model('User', userSchema);


function validateUser(user) {
    console.log('validate: ', user);
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(100).required().email(),
        orgName: Joi.string().min(3).max(50).required(),
        password: Joi.string().min(5).max(50).required(),
        walletType: Joi.string().min(3).max(50).required(),
        privateKey: Joi.string().min(3).max(1024),
        walletAddress: Joi.string().min(3).max(100),
        x509Identity: Joi.object()
    });
    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
