const { User } = require('../models/profile/user');
const _ = require('lodash');
const NodeRSA = require('node-rsa');

module.exports = async function signInTransaction(ownerId, wallet_address, signedHash) {
    try {
        NodeRSA
        return await User.findOne({
            _id: ownerId._id,
            wallet_address: wallet_address
        });
    } catch (e) {
        console.log('>> signIn error: ', e);
        return null;
    }
}