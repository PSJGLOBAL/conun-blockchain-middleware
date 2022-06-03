
const u8a = require('uint8arrays')

function base64ToBytes(string) {
    const inputBase64Url = string.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    return u8a.fromString(inputBase64Url, 'base64')
}
  
function bytesToBase64(bytes){
    return u8a.toString(bytes, 'base64')
}

function JsonToBase64(object) {
    let buff =  Buffer(JSON.stringify(object))
    return buff.toString('base64')
}

function Base64ToJson(object) {
    const inputBase64Url = object.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    return JSON.parse(u8a.fromString(inputBase64Url, 'base64'))
}

function bytesToHex(bytes){
    return u8a.toString(bytes, 'hex')
}

module.exports = {
    base64ToBytes,
    bytesToBase64,
    JsonToBase64,
    Base64ToJson,
    bytesToHex
}
