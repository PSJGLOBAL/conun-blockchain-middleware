const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: false,
        minlength: 5,
        maxlength: 100,
    },
    orgName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 10,
    },
    walletAddress: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 36,
    },
    JWKeyStore: {
        type: Object,
        required: false,
        minlength: 10,
        maxlength: 300,
    },
    walletSignature: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 100,
    },
    balance: {
        type: Number,
        required: false,
        minlength: 1,
        maxlength: 300,
    },
    swaps: [{type: mongoose.Schema.Types.ObjectId,ref:'Swap'}],
    createdAt: { type: Date, default: Date.now },
    isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({_id: this._id, isAdmin: this.isAdmin, walletAddress: this.walletAddress, walletSignature: this.walletSignature}, process.env.JWT_PRIVATE_KEY, { expiresIn: '365d' });
}

const User = mongoose.model('User', userSchema);



function validateWalletSign(user) {
    const schema = Joi.object({
        orgName: Joi.string().valid('Org1', 'Org2', 'Org3').required(),
        walletType: Joi.string().valid('ETH', 'BSC', 'DOT').required(),
        walletAddress: Joi.string().min(5).max(300).required(),
        publicKey: Joi.string().required()
    });
    return schema.validate(user);
}

exports.User = User;
exports.userSchema = userSchema;
exports.validateWalletSign = validateWalletSign;
