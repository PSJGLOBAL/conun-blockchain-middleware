const NodeRSA = require('node-rsa');
const rsaToken =  require('./index');

const key = new NodeRSA({b:1024});

let publicKey = key.exportKey('public');
let privateKey = key.exportKey('private');
console.log('publicKey: ', publicKey);
console.log('privateKey: ', privateKey);

var secret = '123456';

let _key = '-----BEGIN RSA PRIVATE KEY-----\n' +
  'MIICXAIBAAKBgQDTsfz84O1zT5oEm4YWk3ntC3PgzE1kzmI+54ZvwVQrTgSWb68V\n' +
  'GHv6WxvA89vSiS3mAnRCxj92S3SUOAPPdGRFLTt6cxtTmVzURrqIvkcgJqb8R1AJ\n' +
  '87s9hp9lo2RD8m4iyZkBJLMqr/NwMZ6Gy4+Ko3IseIaZhU26fCw7BvZ9EQIDAQAB\n' +
  'AoGAZhotk+YEgJ4/AcPlK1Rb9SmV7TF8jodAOWi/nX0YVH6fldMuFbWmbjytKSY0\n' +
  'utmxCoPagS5PA4YnJynRJKjVhutW76LPiE+lZrWUzOVLWOsjx3KFrBfNZJdjTKqU\n' +
  'PE/z3OOG9hscuAsUnZSCs2JXDGgI769kfBOnhFPkxUqtAwUCQQDpbu/XbYV/W3VM\n' +
  'kX2oaiIW7sJ+bIBG/kVFgvfkkZAUDnwQGmPfZIOj5YhjRuivAMjWPWLfUe030zbe\n' +
  'J7TK5sYvAkEA6CkSfpgddjsEOn6MWiTDgIIYerd5dwOKd3S5HYRSXzG7QJYg6zEI\n' +
  'i0JjtgK9y1qeNLt/7440CC/qLdzMJjlgvwJAamVtHiTGNzFJepfJzWxqk0dKEPOF\n' +
  'WFZm3nL+aAjMwceEVpagtN6MfbSOAKn+Pl2+LKAYI6+kztAPbxxr9BtRcwJBAJCA\n' +
  'wBo75Fqq8T7XddTF/UoHr+TyPpBti8o+xNoyenL2KW9SArthkcfcUuP/YNMqXD7G\n' +
  'ViNth8VwzXoubIN+Q1ECQBOXtWlCeit3JFd4ZZRihU+oBg0A6lizG/Emujqoxq9D\n' +
  'VZ0BA5kyM+QO3NtMYfMq7BUcwrkDVAm4z8Kd+U0mV8k=\n' +
  '-----END RSA PRIVATE KEY-----';


let key_private = new NodeRSA(privateKey);
let key_public = new NodeRSA(publicKey);


// Public Key for encription
let encryptedString = key_public.encrypt(secret, 'base64');
console.log('encryptedString: ', encryptedString);

// Public Key for decription
let decryptedString = key_private.decrypt(encryptedString, 'utf8');
console.log('decryptedString: ', decryptedString);

var payload = {foo: 'bar', secret: encryptedString};

var signOptions = {
  issuer : "saidovjamshid",
  expiresIn: '1000ms',
  algorithm: "RS256"
};

// Create the JWT Token
var token = rsaToken.sign(payload, privateKey, signOptions);
// Send this token to the client so that it can be used in subsecuent request
console.log("\n Token: " + token);

// token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJzZWNyZXQiOiJNa0ZaTlZJekVjZlFFamZtbkthd1RHdW1lWnk2djRmaVEwNCtYMkRrbHdRV3YvKzR4dVFMSlBLVnAyZUN1ZzZYT1JDMlJjK2tCTUZPdUp0WDkyUCt1anJhVExUeTJzT0Z1VDFzWDBNaEJvNzR3cUJXa01VT09UOUpvUmlRUWcwNHNFREFjcHZIa09GT0NWcWEyZ2VhNGlhSCtUdlhPMnBsbDcyUGt4VDYxK3c9IiwiaWF0IjoxNjI3OTczMjYzLCJleHAiOjE2Mjc5NzMyNjQsImlzcyI6InNhaWRvdmphbXNoaWQifQ.RUQ8OF1NXIOWwBRiWHppb0I8ucGS_g6Ju-RrM_waFr9BUVI6RtVcN4dQoLu_TzmvwsRHkVee3t9KScWKn4cuLEj26J_CeB9ETNmmGtFvuxnnUiwsDCAZIiUzNz2QJ51u0h-VEnNKtjged1KBqFptDj1VgbLnVQR4Rr1Kvg6QZo0'
// verify

var verifyOptions = {
  algorithms: ["RS256"]
};

rsaToken.verify(token, publicKey, verifyOptions,function(err, decoded) {
  console.log("\n Verified: " + JSON.stringify(decoded));
});

// var verified = rsaToken.verify(token, publicKey, verifyOptions);
// console.log("\n Verified: " + JSON.stringify(verified));

//
var decoded = rsaToken.decode(token, {complete: true});
console.log('\n msg: ', decoded);