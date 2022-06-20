const jose = require('jose')

class JOSEJWE {
    
    _secretKey = null;
    _issuer  = null;
    _audience = null;

    setSecretKey(obj) {
       this._secretKey = obj.secretKey
       this._issuer = obj.issuer
       this._audience = obj.audience
       return this
    }

    async generateKeyPair() {
        return await jose.generateKeyPair('PS256')
    }

    async signEncrypt(certificate) {
        try {
            return await new jose.EncryptJWT(certificate)
                .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
                .setIssuedAt()
                .setIssuer(this._issuer)
                .setAudience(this._audience)
                .setExpirationTime('5s')
                .encrypt(this.secretKey)
        } catch (error) {
            console.log('enc: ', error)
        }
    }

    async signDecrypt(jwt) {
       return await jose.jwtDecrypt(jwt, this._secretKey, {
        issuer: this._issuer,
        audience: this._audience
       })
    }

    async encrypt(certificate) {
        return await new jose.CompactEncrypt(
            new TextEncoder().encode(
                JSON.stringify(certificate)
            )
            )
            .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
            .encrypt(this._secretKey)
    }


    async decrypt(jwe) {
        return await jose.compactDecrypt(jwe, this._secretKey)
    }
}

module.exports = JOSEJWE


//let pubKeyHex = '02004cbe828243d9b8fe87cf917ba1e38e5e8cda6fbef69721cbf39504ba5f44d8' 
// const Elitejose = new EclticJOSE();
// let jwk = Elitejose.setPrivateKey('81e02f4a9632dc0ac06bc12257999f136e51f673e2a1d7bf903d928c291e818d')
// console.log('jwk: ', jwk)
// let jwe = Elitejose.setPublicKey(pubKeyHex)
// console.log('jwe: ', jwe)



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
