const EC = require('elliptic').ec;
let elliptic = require('elliptic');
const { hexToBytes, bytesToBase64url } = require('./u8a.multiformats')

function getPublicJWK(_publicKey) {
  try {
    console.log('_publicKey: ', _publicKey)
    const secp256k1 = new elliptic.ec('secp256k1');
    const kp = secp256k1.keyFromPublic(_publicKey, 'hex')
    
    return  {
      crv: 'secp256k1',
      kty: 'EC',
      x: bytesToBase64url(hexToBytes(kp.getPublic().getX().toString('hex'))),
      y: bytesToBase64url(hexToBytes(kp.getPublic().getY().toString('hex'))),
    }
  } catch (error) {
    console.log('_publicKey err: ', error)
  }
}

function recoverPublicJWK(msgHash, signature, ) {
  const secp256k1 = new EC('secp256k1')
  let hexToDecimal = (x) => secp256k1.keyFromPrivate(x, "hex").getPrivate().toString(10);
  const kp = secp256k1.recoverPubKey(
    hexToDecimal(msgHash), signature, signature.recoveryParam, "hex");
  return  {
    crv: 'secp256k1',
    kty: 'EC',
    x: bytesToBase64url(hexToBytes(kp.getPublic().getX().toString('hex'))),
    y: bytesToBase64url(hexToBytes(kp.getPublic().getY().toString('hex'))),
  }
}

function getPrivateJWK(_privateKey) {
  const secp256k1 = new EC('secp256k1')
  const kp = secp256k1.keyFromPrivate(_privateKey)
  const privateKey = String(kp.getPrivate('hex'))
  
 /* privateJwk:  {
    kty: 'EC',
    crv: 'P-256',
    x: '7E0r47-jxDft4-nk_YEJfSMYKHO3iSGML7cor-8eJEE',
    y: 'vOz2h6ivINceJ43wZZTONn-aWx48q-oDXzcmDP3vrR0',
    d: 'igF6JY5QeQZEpBf07lC9AooUh_jlXKQCL6m7hD4Veds'
  }*/

  return  {
    privateKey: {
      crv: 'secp256k1',
      kty: 'EC',
      x: bytesToBase64url(hexToBytes(kp.getPublic().getX().toString('hex'))),
      y: bytesToBase64url(hexToBytes(kp.getPublic().getY().toString('hex'))),
      d: bytesToBase64url(hexToBytes(privateKey)),
    },
    publicKey: {
      crv: 'secp256k1',
      kty: 'EC',
      x: bytesToBase64url(hexToBytes(kp.getPublic().getX().toString('hex'))),
      y: bytesToBase64url(hexToBytes(kp.getPublic().getY().toString('hex'))),
      
    }
  }
  
}

function getECSecp256k1KeyPair(_privateKey) {
  const secp256k1 = new EC('secp256k1')
  let keyPair = secp256k1.keyFromPrivate(_privateKey);
  let privKey = keyPair.getPrivate("hex");
  let pubKey = keyPair.getPublic();

  return {
    privateKey: privKey,
    publicKey: pubKey,
    address: pubKey.encodeCompressed("hex")
  }
}


module.exports = {
    getPublicJWK,
    recoverPublicJWK,
    getPrivateJWK,
    getECSecp256k1KeyPair
}