const Crypto = require('crypto');
const secp256k1 = require('secp256k1');
const createKeccakHash = require('keccak');
const KeyResolver = require('key-did-resolver')
const {Ed25519Provider} = require('key-did-provider-ed25519')
const { DID } = require('dids')
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
        address
    }
}


async function CreateDID(seed) {
    const provider = new Ed25519Provider(Buffer.from(seed, 'hex'))
    const did = new DID({ provider, resolver: KeyResolver.getResolver() })
    await did.authenticate()
    return did
}

module.exports = {
    createWallet,
    CreateDID
}
