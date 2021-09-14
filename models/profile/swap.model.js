const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const {userSchema} = require('./user')

const swapSchema = new mongoose.Schema({
    swapType: {
        type: String,
        enum: ['CONtoCONX', 'CONXtoCON'],
        required: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    amount: {
        type: String,
        required: true,
        maxlength: 10,
    },
    swapID: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 100,
    },
    swapKey: {
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 100,
    },
    messageHash: {
        type: String,
        required: false,
        minlength: 10,
        maxlength: 300,
    },
    signature: {
        type: String,
        required: false,
        minlength: 10,
        maxlength: 300,
    },
    txHash: {
        type: new mongoose.Schema({
            ethereumTx: {
                type: String,
                required: false,
                unique: true,
                sparse: true,
                minlength: 10,
                maxlength: 100,
            },
            conunTx: {
                type: String,
                required: false,
                unique: true,
                sparse: true,
                minlength: 10,
                maxlength: 100,
            }
        })
    },
    isComplited: Boolean,
    createdAt: { type: Date, default: Date.now },
    complitedAt: {type: Date}
})


const Swap = mongoose.model('Swap', swapSchema);


function validateSwap(req) {
    const schema = Joi.object({
        amount: Joi.string().max(10).required(),
        walletAddress: Joi.string().min(5).required()
    });
    return schema.validate(req);
}


exports.Swap = Swap;
exports.validateSwap = validateSwap;