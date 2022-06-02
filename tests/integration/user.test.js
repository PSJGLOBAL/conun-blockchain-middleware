process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
//{ createWallet, CreateDID, CreateSignature, VerifySignature }
const  Helper = require('../integration/helper/utils');
let server;

const should = chai.should();
const expect = chai.expect();
chai.use(chaiHttp);

describe('USER', async() => {
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach(() => {
        server.close();
    });

    describe('POST / import ', () => {
        let responce = null;
        let orgName;
        let walletType;
        let walletAddress;
        let publicKey;
        let ecdsaHeader;

        const execute = () => {
        console.log('>> sign  before send: ',  JSON.stringify(ecdsaHeader))
        return new Promise( (resolve, reject) => {
                chai.request(server)
                .post('/api/v1/users/wallet-sign')
                .send({
                    orgName,
                    walletType,
                    walletAddress,
                    publicKey,
                    ecdsaHeader: JSON.stringify(ecdsaHeader)
                }).end(function(err, res) {
                    if(err) reject(err)
                    resolve(res)
                })
            })
        };

        beforeEach(async () => {
            let wallet = Helper.createWallet();
            let did = await Helper.CreateDID(wallet.privateKey)
            orgName = 'Org1'
            walletType = 'ETH'
            walletAddress = wallet.asddress
            publicKey = did.id
            ecdsaHeader = await Helper.CreateSignature({
                orgName,
                walletType,
                walletAddress,
                publicKey
            }, wallet.privateKey)
            
        });

        it('1.', async () => {
            const res = await execute()
            responce = res.body;
            console.log('responce: ', responce)
            expect(res.status).to.equal(200);
            should().not.Throw;
        });
    });
});