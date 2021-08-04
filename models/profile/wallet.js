const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');


const walletSchema = new mongoose.Schema({
    walletType: {
        type: String,
        enum: ['ETH', 'BSC', 'DOT'],
        required: true
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 300,
    },
    keyStore: {
        type: Object,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 1024,
    },
    createdAt: { type: Date, default: Date.now },
    isActive: Boolean
});

const Wallet = mongoose.model('Wallet', walletSchema);


function validateWallet(user) {
    const schema = Joi.object({
        walletType: Joi.string().valid('ETH', 'BSC', 'DOT').required(),
        walletAddress: Joi.string().min(5).max(300).required(),
        keyStore: Joi.string().min(10).max(1024).required()
    });
    return schema.validate(user);
}

exports.Wallet = Wallet;
exports.validate = validateWallet;
exports.walletSchema = walletSchema;