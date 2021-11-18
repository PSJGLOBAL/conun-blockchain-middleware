const crypto = require('crypto');
const Helper = require('../../common/helper');
const logger = Helper.getLogger('utils/crypto/encryption.algorithm');

function getKey(password) {
    const ENC_KEY  = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 32);
    const IV = crypto.createHash('sha256').update(String(password)).digest('base64').substr(0, 16);
    return {
        ENC_KEY,
        IV
    }
}

module.exports = {
    AesEncrypt : (data, password) => {
        try {
            let _getKey = getKey(password);
            let cipher = crypto.createCipheriv('aes-256-cbc', _getKey.ENC_KEY, _getKey.IV);
            let encrypted = cipher.update(data, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            return encrypted;
        } catch (e) {
            logger.error('AesEncrypt error', e.message)
            return false
        }
    },

    AESDecrypt : (encrypted, password) => {
        try {
            let _getKey = getKey(password)
            let decipher = crypto.createDecipheriv('aes-256-cbc', _getKey.ENC_KEY, _getKey.IV);
            let decrypted = decipher.update(encrypted, 'base64', 'utf8');
            return (decrypted + decipher.final('utf8'));
        } catch (e) {
            logger.error('AESDecrypt error', e.message)
            return false
        }
    }
}

