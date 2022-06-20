const u8a = require('uint8arrays')

function base64ToBytes(string) {
    const inputBase64Url = string.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    return u8a.fromString(inputBase64Url, 'base64')
}
  
function bytesToBase64url(bytes){
    return u8a.toString(bytes, 'base64url')
}

function JsonToBase64(object) {
    let buff =  Buffer(JSON.stringify(object))
    return buff.toString('base64')
}

function Base64ToJson(object) {
    const inputBase64Url = object.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    return JSON.parse(u8a.fromString(inputBase64Url, 'base64'))
}

function hexToBytes(s) {
    const input = s.startsWith('0x') ? s.substring(2) : s
    return u8a.fromString(input.toLowerCase(), 'base16')
}


function bytesToHex(bytes){
    return u8a.toString(bytes, 'hex')
}


module.exports = {
    base64ToBytes,
    bytesToBase64url,
    JsonToBase64,
    Base64ToJson,
    bytesToHex,
    hexToBytes
}
