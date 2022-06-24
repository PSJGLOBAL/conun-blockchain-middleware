'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const Eth = require('../../app/web3/eth.main');
const  Helper = require('./helper/utils');
const { DID } = require('conun-dids')
const { Ed25519Provider } = require('key-did-provider-ed25519')
const KeyResolver = require('key-did-resolver').default
const sha3 = require('js-sha3')
const JoseJwe  = require('../../utils/crypto/jose.encryption')
let server;

var assert = chai.assert;    // Using Assert style
var expect = chai.expect;    // Using Expect style
var should = chai.should();  // Using Should style
chai.use(chaiHttp);

describe('USER', async() => {
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach(() => {
        server.close();
    });

    describe('POST / Wallet Create', () => {
        let responce = null;
        let orgName;
        let walletType;
        let walletAddress;
        let publicKey;
        let signHeader;
        let rootHash;
        let seed;

        beforeEach(async () => {
            let wallet = Helper.createWallet();
            seed = await Eth.CreateSignature(wallet.address, wallet.privateKey)
      
            let baseKey = sha3.keccak256(seed.signature)
            const provider = new Ed25519Provider(Buffer.from(baseKey, 'hex'))
            const did = new DID({ provider, resolver: KeyResolver.getResolver()})
            await did.authenticate()

            rootHash = sha3.keccak256('123')
            let sign = await Eth.CreateSignature(rootHash, wallet.privateKey)
            console.log('hashed: ', sign)

            orgName = 'Org1'
            walletType = 'ETH'
            walletAddress = wallet.address
            publicKey = did.id
            signHeader = sign
            rootHash
        });

        it('1.Should Create New Wallet', () => {
            console.log('>> ', {
                orgName,
                walletType,
                walletAddress,
                publicKey,
                signHeader,
                rootHash
            })
            chai.request(server)
                .post('/api/v1/users/create-wallet')
                .send({
                    orgName,
                    walletType,
                    walletAddress,
                    publicKey,
                    signHeader,
                    rootHash
                }).end(async function(err, res) {
                    if(err) console.log(err)
                    responce = res.body;
                    console.log('responce: ', responce)
                    
                    const decryptedToken = await new JoseJwe()
                    .setSecretKey({
                        secretKey: new Uint8Array(Buffer.from(rootHash, 'hex')),
                        issuer: publicKey,
                        audience: publicKey
                    }).signDecrypt(responce.payload.encryptedToken)
                    console.log('decryptedToken: ', decryptedToken.payload.jwe)
                    
                    let baseKey = sha3.keccak256(seed.signature)
                    console.log('baseKey: ', baseKey)
                    const provider = new Ed25519Provider(Buffer.from(baseKey, 'hex'))
                    const did = new DID({ provider, resolver: KeyResolver.getResolver()})
                    await did.authenticate()
                    console.log('did.id: ', did.id)

                    const dec = await did.decryptDagJWE(decryptedToken.payload.jwe)
                    console.log('jwe: ', dec)

                    expect(res.status).to.equal(201);
                    should.not.Throw;
                })
        });
    });


    describe('POST / Login Wallet', () => {
        let responce = null;
        let orgName;
        let walletType;wallet
        let walletAddress;
        let publicKey;
        let signHeader;
        let rootHash;
        let seed;
        let encryptedParam;

        beforeEach(async () => {

            let wallet = {
                privateKey: 'fa0ec3ed4f0a5f15776b84db2e6256bcbd222ae67ad870a058d82b94cc813ede',
                address: '0x55e94f8c6dd4ab82f44b63107aea8c81c294f3b9',
                publicKey: '6625a3009a35b19a559b1c84017d3b28be15201a4131a5500d7e467923897b1e7dc09fdbec78c1c697a374d5bff0c2f5a54411d45c8e9eee8ef6dad9dcf33452'
            }
            seed = await Eth.CreateSignature(wallet.address, wallet.privateKey)
            console.log('seed: ', seed)
      
            let baseKey = sha3.keccak256(seed.signature)
            console.log('baseKey: ', baseKey)
            const provider = new Ed25519Provider(Buffer.from(baseKey, 'hex'))
            const did = new DID({ provider, resolver: KeyResolver.getResolver()})
            await did.authenticate()
            console.log('did.id: ', did.id)

            rootHash = sha3.keccak256('123')
            console.log('rootHash: ', rootHash)
            let sign = await Eth.CreateSignature(rootHash, wallet.privateKey)
            console.log('hashed: ', sign)

            orgName = 'Org1'
            walletType = 'ETH'
            walletAddress = wallet.address
            publicKey = did.id
            signHeader = sign
            rootHash
        });

        it('1.Should Create New Wallet', () => {
            console.log('>> ', {
                orgName,
                walletType,
                walletAddress,
                publicKey,
                signHeader,
                rootHash
            })
            chai.request(server)
                .post('/api/v1/users/login-wallet')
                .send({
                    orgName,
                    walletType,
                    walletAddress,
                    publicKey,
                    signHeader,
                    rootHash
                }).end(async function(err, res) {
                    if(err) console.log(err)
                    responce = res.body;
                    console.log('responce: ', responce)
                    
                    const decryptedToken = await new JoseJwe()
                    .setSecretKey({
                        secretKey: new Uint8Array(Buffer.from(rootHash, 'hex')),
                        issuer: publicKey,
                        audience: publicKey
                    }).signDecrypt(responce.payload.encryptedToken)
                    console.log('decryptedToken: ', decryptedToken.payload.jwe)
                    
                    let baseKey = sha3.keccak256(seed.signature)
                    console.log('baseKey: ', baseKey)
                    const provider = new Ed25519Provider(Buffer.from(baseKey, 'hex'))
                    const did = new DID({ provider, resolver: KeyResolver.getResolver()})
                    await did.authenticate()
                    console.log('did.id: ', did.id)

                    const dec = await did.decryptDagJWE(decryptedToken.payload.jwe)
                    console.log('jwe: ', dec)

                    expect(res.status).to.equal(201);
                    should.not.Throw;
                })
        });
    });

});