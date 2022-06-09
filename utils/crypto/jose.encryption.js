const jose = require('jose')
const {getPrivateJWK, getPublicJWK} = require('../elliptic')

class EclticJOSE {
    
    setPrivateKey(_privateKey) {
       return getPrivateJWK(_privateKey)
    }

    setPublicKey(_publicKey) {
        return getPublicJWK(_publicKey)
    }

    encrypt(data, publicKey) {
        return await new jose.GeneralEncrypt(
                    new TextEncoder().encode(
                        data
                    )
                  )
                  .setProtectedHeader({ enc: 'A256GCM' })
                  .addRecipient(publicKey)
                  .setUnprotectedHeader({ alg: 'ECDH-ES+A256KW' })
                  .encrypt()
    }

    decrypt() {
        
    }
} 

let pubKeyHex = '04004cbe828243d9b8fe87cf917ba1e38e5e8cda6fbef69721cbf39504ba5f44d87eb135b6746efe50f8638a5b578da709ab5e07faf2ea5a1f428c0d6bcb72e7a6' 
const Elitejose = new EclticJOSE();
let jwk = Elitejose.setPrivateKey('81e02f4a9632dc0ac06bc12257999f136e51f673e2a1d7bf903d928c291e818d')
console.log('jwk: ', jwk)
let jwe = Elitejose.setPublicKey(pubKeyHex)
console.log('jwe: ', jwe)




// let keyPair = ec.keyFromPrivate("81e02f4a9632dc0ac06bc12257999f136e51f673e2a1d7bf903d928c291e818d");
// let privKey = keyPair.getPrivate();
// let pubKey = keyPair.getPublic();
// console.log('pubKey: ', pubKey)
// console.log(`Private key: ${privKey.toString("hex")}`);
// console.log("Public key :", pubKey.encode("hex"));
// console.log("Public key (compressed):",pubKey.encodeCompressed("hex"));
//     var key = ec.keyFromPublic(pubKey.encode("hex"), 'hex');
//     console.log('key: ', key)


//   let publicKey = await jose.importJWK(pubKey, 'secp256k1'); 
//   console.log('publicKey: ', publicKey)

//     const jwe = await new jose.GeneralEncrypt(
//         new TextEncoder().encode(
//           'It’s a dangerous business, Frodo, going out your door.'
//         )
//       )
//       .setProtectedHeader({ enc: 'A256GCM' })
//       .addRecipient(publicKey)
//       .setUnprotectedHeader({ alg: 'ECDH-ES+A256KW' })
//       .encrypt()
      
//       console.log('jwe: ', jwe)
