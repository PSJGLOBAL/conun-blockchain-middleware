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

    async signEncrypt(jwe) {
        try {
            console.log('>> jwe: ', jwe)
            return await new jose.EncryptJWT({jwe})
                .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
                .setIssuedAt()
                .setIssuer(this._issuer)
                .setAudience(this._audience)
                .setExpirationTime('5s')
                .encrypt(this._secretKey)
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
}

module.exports = JOSEJWE