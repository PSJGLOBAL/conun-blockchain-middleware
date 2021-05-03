const crypto = require('crypto');

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
            console.log('AesEn: ', data, password);
            let _getKey = getKey(password);
            let cipher = crypto.createCipheriv('aes-256-cbc', _getKey.ENC_KEY, _getKey.IV);
            let encrypted = cipher.update(data, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            return encrypted;
        } catch (e) {
            console.log('AesEncrypt error', e.message)
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
            console.log('AESDecrypt error', e.message)
            return false
        }
    }
}


// const ENC_KEY  = crypto.createHash('sha256').update(String('secret')).digest('base64').substr(0, 32);
// const IV = crypto.createHash('sha256').update(String('secret')).digest('base64').substr(0, 16);
//
//
// console.log('ENC_KEY: ', ENC_KEY)
// console.log('IV: ', IV)
// const phrase = "who let the dogs out";
//
// const encrypt = ((val) => {
//     let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
//     let encrypted = cipher.update(val, 'utf8', 'base64');
//     encrypted += cipher.final('base64');
//     return encrypted;
// });
//
// const decrypt = ((encrypted) => {
//     let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
//     let decrypted = decipher.update(encrypted, 'base64', 'utf8');
//     return (decrypted + decipher.final('utf8'));
// });
//
//
//
// let encrypted_key = encrypt(phrase);
// console.log('encrypted_key: ', encrypted_key)
// let original_phrase = decrypt(encrypted_key);
// console.log('original_phrase: ', original_phrase)

