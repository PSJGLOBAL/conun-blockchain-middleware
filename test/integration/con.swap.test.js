const request = require('supertest');
const path = require('path');
const { Wallets } = require('fabric-network');
const Eth = require('../../app/web3/eth.main');
const adminConfig = require('./private.json');


let server;


describe('BRIDGE SWAP', () => {
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach(() => {
        server.close();
    });


    describe('POST / CON -> NewDeposit', () => {
        const execute = async (hashed) => {
            return await request(server)
                .post('/api/v1/con-token/channels/mychannel/chaincodes/bridge')
                .set('jwtAuthToken', adminConfig.jwtAuthToken)
                .send({
                    fcn,
                    orgName,
                    password,
                    id,
                    walletAddress,
                    amount,
                    messageHash: hashed.messageHash,
                    signature: hashed.signature
                });
        };
        
        beforeEach(() => {
            fcn = "MintAndTransfer"
            orgName = adminConfig.orgName
            password = adminConfig.password
            id = "0xa4287e0024343dd3b107be1db5ad6fcc7e1413ed50ec32fb68cbb5c2673f1a5d"
            walletAddress = adminConfig.walletAddress
            amount = "10000"
        });

        it('1- CONX Mint', async () => {
            let hashed = await Eth.CreateSignature('aaaa', adminConfig.privateKey)
            console.log('hashed: ', hashed);
            const res = await execute(hashed);
            console.log('swap response: ', res.body);
            expect(res.status).toBe(200);
        });
    });



    setTimeout(function () {
    },  1000)

});