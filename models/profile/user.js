const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const {walletSchema} = require('./wallet');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
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
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 300,
    },
    x509keyStore: {
        type: Object,
        unique: true,
        minlength: 10,
        maxlength: 1024,
    },
    walletSignature: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 300,
    },
    createdAt: { type: Date, default: Date.now },
    isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function (publicKey) {
    return jwt.sign({_id: this._id, isAdmin: this.isAdmin, walletAddress: this.walletAddress, walletSignature: this.walletSignature, publicKey: publicKey}, config.get('jwtPrivateKey'), { expiresIn: '365d' });
}

const User = mongoose.model('User', userSchema);


function validateMember(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(100).email().required(),
        token: Joi.string().min(5).max(300).required(),
        oauthType: Joi.string().valid('google', 'kakao').required(),
        orgName: Joi.string().valid('Org1', 'Org2', 'Org3').required(),
        password: Joi.string().min(5).max(50).required(),
        walletType: Joi.string().valid('ETH', 'BSC', 'DOT').required(),
        walletAddress: Joi.string().min(5).max(300).required(),
        keyStore: Joi.object().required()
    });
    return schema.validate(user);
}

function validateNoneMember(user) {
    const schema = Joi.object({
        orgName: Joi.string().valid('Org1', 'Org2', 'Org3').required(),
        password: Joi.string().min(5).max(50).required(),
        walletType: Joi.string().valid('ETH', 'BSC', 'DOT').required(),
        walletAddress: Joi.string().min(5).max(300).required(),
        keyStore: Joi.object().required()
    });
    return schema.validate(user);
}

function validateAuthLogin(req) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required(),
        token: Joi.string().min(5).max(300).required(),
        oauthType: Joi.string().valid('google', 'kakao').required()
    });
    return schema.validate(req);
}

function validateWalletLogin(req) {
    const schema = Joi.object({
        walletAddress: Joi.string().min(5).max(300).required(),
        password: Joi.string().min(5).max(1024).required()
    });
    return schema.validate(req);
}

function validateWalletImport(req) {
    const schema = Joi.object({
        orgName: Joi.string().valid('Org1', 'Org2', 'Org3').required(),
        password: Joi.string().min(5).max(1024).required(),
        x509Identity: Joi.object({
            walletAddress: Joi.string().min(5).max(300).required(),
            credentials: Joi.object().required(),
            mspId: Joi.string().valid('Org1MSP', 'Org2MSP', 'Org3MSP').required(),
            type: Joi.string().required(),
        }).required()
    });
    return schema.validate(req);
}


function validateLinkedWallet(req) {
    const schema = Joi.object({
        orgName: Joi.string().valid('Org1', 'Org2', 'Org3').required(),
        password: Joi.string().min(5).max(1024).required(),
        walletType: Joi.string().valid('ETH', 'BSC', 'DOT').required(),
    });
    return schema.validate(req);
}

exports.User = User;
exports.validateMember = validateMember;
exports.validateNoneMember = validateNoneMember;
exports.validateAuthLogin = validateAuthLogin;
exports.validateWalletLogin = validateWalletLogin;
exports.validateWalletImport = validateWalletImport;
exports.validateLinkedWallet = validateLinkedWallet;
