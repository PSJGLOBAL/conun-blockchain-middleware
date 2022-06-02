const Crypto = require('crypto');
const secp256k1 = require('secp256k1');
const createKeccakHash = require('keccak');
const KeyResolver = require('key-did-resolver')
const {Ed25519Provider} = require('key-did-provider-ed25519')
const { DID } = require('dids')

function createWallet() {
    var privateKey = Crypto.randomBytes(32);
    var pubKey = secp256k1.publicKeyCreate(privateKey,false).slice(1);
    var address = createKeccakHash('keccak256').update(Buffer.from(pubKey)).digest().slice(-20);
    console.log('privateKey: ', privateKey.toString('hex'));
    console.log('address: ', address.toString('hex'));
    return {
        privateKey: privateKey.toString('hex'),
        asddress: address.toString('hex')
    }
}

async function CreateSignature(data, privateKey) {
    const hash = Crypto.createHash('sha256').update(JSON.stringify(data)).digest(32).toString('hex');
    const ecdsaSig = secp256k1.ecdsaSign(Buffer.from(hash, 'hex'), Buffer.from(privateKey, 'hex'));
    console.log('ecdsaSig: ', ecdsaSig)
    return {hash, ecdsaSig};
}

async function VerifySignature (signature, hash, address) {
    return secp256k1.ecdsaVerify(signature, Buffer.from(hash, 'hex'), Buffer.from(address, 'hex'))
}

async function CreateDID(seed) {
    const provider = new Ed25519Provider(Buffer.from(seed, 'hex'))
    const did = new DID({ provider, resolver: KeyResolver.getResolver() })
    await did.authenticate()
    return did
}

module.exports = {
    createWallet,
    CreateSignature,
    VerifySignature,
    CreateDID
}
