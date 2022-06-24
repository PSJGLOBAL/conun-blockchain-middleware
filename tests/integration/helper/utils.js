const Crypto = require('crypto');
const secp256k1 = require('secp256k1');
const createKeccakHash = require('keccak');
const u8a = require('../../../utils/u8a.multiformats')

function createWallet() {
    var privateKey = Crypto.randomBytes(32);
    var pubKey = secp256k1.publicKeyCreate(privateKey,false).slice(1);
    var address = createKeccakHash('keccak256').update(Buffer.from(pubKey)).digest().slice(-20).toString('hex');
    // console.log('privateKey: ', privateKey.toString('hex'));
    // console.log('pubKey: ', u8a.bytesToHex(pubKey));
    // console.log('address: ', address.toString('hex'));
    if (!address.includes('0x')) address = '0x' + address;
    return {
        privateKey: privateKey.toString('hex'),
        address,
        publicKey: Buffer.from(pubKey).toString('hex')
    }
}

module.exports = {
    createWallet
}
