'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const Eth = require('../../app/web3/eth.main');
const  Helper = require('./helper/utils');
const { DID } = require('conun-dids')
const { Ed25519Provider } = require('key-did-provider-ed25519')
const KeyResolver = require('key-did-resolver').default
const sha3 = require('js-sha3')
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

        beforeEach(async () => {
            let wallet = Helper.createWallet();
            let sign = await Eth.CreateSignature(wallet.address, wallet.privateKey)
            console.log('hashed: ', sign)
            let whois = await Eth.VerifySignature(wallet.address, sign.signature)
            console.log('whois: ', whois)
            console.log('wallet.privateKey: ', wallet.privateKey)
            let baseKey = sha3.keccak256(sign.signature)
            console.log('baseKey: ', baseKey)
            const provider = new Ed25519Provider(Buffer.from(baseKey, 'hex'))
            const did = new DID({ provider, resolver: KeyResolver.getResolver()})
            await did.authenticate()
            console.log('did.id: ', did.id)

            orgName = 'Org1'
            walletType = 'ETH'
            walletAddress = wallet.address
            publicKey = did.id
            signHeader = sign
        });

        it('1.Should Create New Wallet', () => {
            console.log('>> ', {
                orgName,
                walletType,
                walletAddress,
                publicKey,
                signHeader
            })
            chai.request(server)
                .post('/api/v1/users/create-wallet')
                .send({
                    orgName,
                    walletType,
                    walletAddress,
                    publicKey,
                    signHeader
                }).end(function(err, res) {
                    if(err) console.log(err)
                    responce = res.body;
                    console.log('responce: ', responce)
                    expect(res.status).to.equal(201);
                    should.not.Throw;
                })
        });
    });
    
    // //1. Import wallet with pk and get JWE
    // //2. decode JWE and Login with Certificate

    // describe('POST / Import Wallet', () => {
    //     let responce = null;
    //     let orgName;
    //     let walletType;
    //     let walletAddress;
    //     let publicKey;
    //     let signHeader;

    //     beforeEach(async () => {
    //         let wallet = Helper.createWallet();
    //         let did = await Helper.CreateDID(wallet.privateKey)
    //         let hashed = await Eth.CreateSignature(JSON.stringify({
    //             walletAddress: wallet.address,
    //             publicKey: did.id
    //         }), wallet.privateKey)

    //         let whois = await Eth.VerifySignature(JSON.stringify({
    //             walletAddress: wallet.address,
    //             publicKey: did.id
    //         }), hashed.signature)
    //         console.log('whois: ', whois)

    //         orgName = 'Org1'
    //         walletType = 'ETH'
    //         walletAddress = wallet.asddress
    //         publicKey = did.id
    //         signHeader = {
    //             messageHash: hashed.messageHash,
    //             signature: hashed.signature
    //         } 
    //     });

    //     it('1.Should Create New Wallet', () => {
    //         console.log('>> ', {
    //                 orgName,
    //                 walletType,
    //                 walletAddress,
    //                 publicKey,
    //                 signHeader
    //         })
    //         chai.request(server)
    //             .post('/api/v1/users/create-wallet')
    //             .send({
    //                 orgName,
    //                 walletType,
    //                 walletAddress,
    //                 publicKey,
    //                 signHeader
    //             }).end(function(err, res) {
    //                 if(err) console.log(err)
    //                 responce = res.body;
    //                 expect(res.status).to.equal(201);
    //                 should.not.Throw;
    //             })
    //     });
    // });


});