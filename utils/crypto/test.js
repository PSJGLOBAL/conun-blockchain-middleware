const crypto = require('./encryption.algorithm')

let encr = crypto.AesEncrypt('encrypt me', '123456');
console.log(encr)
crypto.AESDecrypt(encr, '123456');