const chai = require('chai');
const chaiHttp = require('chai-http');
const Eth = require('../../app/web3/eth.main');
//{ createWallet, CreateDID, CreateSignature, VerifySignature }
const  Helper = require('../integration/helper/utils');
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
            let did = await Helper.CreateDID(wallet.privateKey)

            let hashMsg = Eth.HashMessage(JSON.stringify({
                walletAddress: wallet.address,
                publicKey: did.id
            }))
            console.log('hashMsg: ', hashMsg)
            let hashed = await Eth.CreateSignature(hashMsg, wallet.privateKey)

            let whois = await Eth.VerifySignature(JSON.stringify({
                walletAddress: wallet.address,
                publicKey: did.id
            }), hashed.signature)
            console.log('whois: ', whois)

            orgName = 'Org1'
            walletType = 'ETH'
            walletAddress = wallet.address
            publicKey = did.id
            signHeader = {
                messageHash: hashMsg,
                signature: hashed.signature
            } 
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