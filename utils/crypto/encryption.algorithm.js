const crypto = require('crypto');

module.exports = {
    AesEncrypt : (text, password) => {
        try {
            let key = crypto.createCipher('aes-128-cbc', password);
            let str = key.update(text, 'utf8', 'base64')
            str += key.final('base64');
            console.log(str);
            return str;
        } catch (e) {
            console.log('AesEncrypt error')
        }
    },

    AESDecrypt : (hash, password) => {
        try {
            let key = crypto.createDecipher('aes-128-cbc', password);
            let str = key.update(hash, 'base64', 'utf8')
            str += key.final('utf8');
            console.log(str);
            return str;
        } catch (e) {
            console.log('AESDecrypt error')
        }
    }
}
