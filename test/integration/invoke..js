const path = require('path');
const request = require('supertest');
const {User, validate} = require('../../models/profile/user');

const { Certificate, PrivateKey } = require('@fidm/x509');
const { Wallets } = require('fabric-network');
const jwt = require('jsonwebtoken');

describe('INVOKE INIT CONX', () => {
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach(() => {
        server.close();
    });

    const execute = async () => {
        return await request(server)
            .post('/api/v1/con-token/channels/mychannel/chaincodes/conx')
            .set('jwtAuthToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTFjNWVjYTFjN2YwMjkyODRlODU4ZWQiLCJpc0FkbWluIjp0cnVlLCJ3YWxsZXRBZGRyZXNzIjoiMHg4YzFkMWU2NGEwOTc5OGQ3YmQ2NTYxNGMwZmIzNTk5MGM0YTE0N2I0Iiwid2FsbGV0U2lnbmF0dXJlIjoiMHg5MWZjMDU1MGZlOTRkMmMzZmVlMmE1ZGI5ZjkwY2U3OGVlYTA3OGJiYjE3NzVkZjQzMDRjMzkxMDE5MzI0Yzg4NzE5ZGQ1MGFhZWM4NmFjNDg0Mzg3MGJhYjg3ZTI2Y2FkZWY3NWY5YTYyZjE3OTY0MmE0MmI4ZjE3NzdhYTQ4MDFiIiwiaWF0IjoxNjI5MjQ5NDU3LCJleHAiOjE2NjA3ODU0NTd9.O-duZUCbA5s8cwOFq7OBalKgVV0ePNHPrFhlolrNKd4')
            .send({
                fcn,
                orgName,
                walletAddress
        });
    };

    describe('POST / Init', () => {
        beforeEach(() => {
            fcn = null;
            orgName = null;
            walletAddress = null;
        });

        it('1 - test init', async () => {
            fcn = 'Init';
            orgName = 'Org1';
            walletAddress = '0x39A98cfE183bA67aC37D4b237aC2bf504314A1E9';
            const res = await execute();
            console.log('1 - test Transfer: ', res.body);
            expect(res.status).toBe(400);
        });
    })







    // describe('POST / Transfer', () => {
    //     let fcn;
    //     let orgName;
    //     let fromAddress;
    //     let toAddress;
    //     let value;
    //     let signature;

    //     const execute = async () => {
    //         signature = await sign(fromAddress, {
    //             fcn,
    //             orgName,
    //             fromAddress,
    //             toAddress,
    //             value
    //         });
    //         return await request(server)
    //             .post('/api/v1/con-token/channels/mychannel/chaincodes/conos')
    //             .set('jwtAuthToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDYyYzE2ZmNhYzY5YjM2MTM4MGM2OWYiLCJpc0FkbWluIjpmYWxzZSwid2FsbGV0QWRkcmVzcyI6IjB4RWNmOGY3NDdCOWZFMzRmMjg2RWNkQUI2RTNDNkIyRDYwNzBkNTRBQSIsImlhdCI6MTYxNzA5MzcwNywiZXhwIjoxNjQ4NjI5NzA3fQ.gPuKm3XQ8yJvlyF_VVM7RgV2TiWPayVPswA4DLrn5GE')
    //             .send({
    //                 fcn,
    //                 orgName,
    //                 fromAddress,
    //                 toAddress,
    //                 value,
    //                 signature
    //             });
    //     };

    //     beforeEach(() => {
    //             fcn = 'Transfer';
    //             orgName = 'Org1';
    //             fromAddress = '0xEcf8f747B9fE34f286EcdAB6E3C6B2D6070d54AA';
    //             toAddress = '0x44DAdf6479eC63Ebdd830417212055899Ab28142';
    //             value = 0;
    //     });
    //     it('1 - test Transfer', async () => {
    //         fcn = '';
    //         orgName = '';
    //         fromAddress = '';
    //         toAddress = '';
    //         value = '';
    //         const res = await execute();
    //         console.log('1 - test Transfer: ', res.body);
    //         expect(res.status).toBe(400);
    //     });

    //     it('2 - test Transfer', async () => {
    //         fcn = 'aaaa';
    //         orgName = 'Org1';
    //         fromAddress = '0xEcf8f747B9fE34f286EcdAB6E3C6B2D6070d54AA';
    //         toAddress = '';
    //         value = 0.1;
    //         const res = await execute();
    //         console.log('2 - test Transfer: ', res.body);
    //         expect(res.status).toBe(400);
    //     });

    //     it('3 - test Transfer', async () => {
    //         fcn = 'Transfer';
    //         orgName = 'Org1';
    //         fromAddress = new Array(21).join('X');
    //         toAddress = '0x44DAdf6479eC63Ebdd830417212055899Ab28142';
    //         value = 0.2;
    //         const res = await execute();
    //         console.log('3 - test Transfer: ', res.body);
    //         expect(res.status).toBe(400);
    //     });

    //     it('4 - test Transfer', async () => {
    //         await execute();
    //         const user = await User.findOne({ walletAddress: '0xEcf8f747B9fE34f286EcdAB6E3C6B2D6070d54AA' });
    //         console.log('4 - test Transfer: ', user.email);
    //         expect(user).not.toBeNull();
    //     });
    // });


    // describe('POST / MintAndTransfer', () => {
    //     let fcn;
    //     let orgName;
    //     let walletAddress;
    //     let amount;
    //     let signature;

    //     const execute = async () => {
    //         signature = await sign(walletAddress, {
    //             fcn,
    //             orgName,
    //             walletAddress,
    //             amount
    //         });
    //         return await request(server)
    //             .post('/api/v1/con-token/channels/mychannel/chaincodes/conos')
    //             .set('jwtAuthToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDUxODZkY2VlZjExMzU5NmI3OWM1YjkiLCJpc0FkbWluIjpmYWxzZSwid2FsbGV0QWRkcmVzcyI6IjB4MDdBRUZlNDE0MjgxNDZEMDFkNTk1MzYyNkZDYTQwOEEyYmI1ODc5MiIsImlhdCI6MTYxNTk1NTY5MSwiZXhwIjoxNjQ3NDkxNjkxfQ.W-VdPOsZXtXd1PgL0H8aW-HcNFnqhxOV2N1eJSR0GIE')
    //             .send({
    //                 fcn,
    //                 orgName,
    //                 walletAddress,
    //                 amount,
    //                 signature
    //             });
    //     };

    //     beforeEach(() => {
    //         fcn = 'MintAndTransfer';
    //         orgName = 'Org1';
    //         walletAddress = '0x07AEFe41428146D01d5953626FCa408A2bb58792';
    //         amount = 10;
    //     });

    //     it('1 - test MintAndTransfer', async () => {
    //         fcn = '';
    //         orgName = '';
    //         walletAddress = '';
    //         amount = '';
    //         const res = await execute();
    //         console.log('1 - test MintAndTransfer: ', res.body);
    //         expect(res.status).toBe(400);
    //     });

    //     it('2 - test MintAndTransfer', async () => {
    //         fcn = 'aaaa';
    //         orgName = 'Org1';
    //         walletAddress = '0x07AEFe41428146D01d5953626FCa408A2bb58792';
    //         amount = 100;
    //         const res = await execute();
    //         console.log('2 - test MintAndTransfer: ', res.body);
    //         expect(res.status).toBe(400);
    //     });

    //     it('3 - test MintAndTransfer', async () => {
    //         fcn = 'MintAndTransfer';
    //         orgName = 'Org1';
    //         walletAddress = new Array(21).join('C');
    //         amount = 100;
    //         const res = await execute();
    //         console.log('3 - test MintAndTransfer: ', res.body);
    //         expect(res.status).toBe(400);
    //     });

    //     it('4 - test MintAndTransfer', async () => {
    //         const res = await execute();
    //         console.log('4 - test MintAndTransfer: ', res.body);
    //         expect(res.status).toBe(200);
    //     });
    // });


    // describe('POST / BurnFrom', () => {
    //     let fcn;
    //     let orgName;
    //     let walletAddress;
    //     let amount;
    //     let signature;

    //     const execute = async () => {
    //         signature = await sign(walletAddress, {
    //             fcn,
    //             orgName,
    //             walletAddress,
    //             amount
    //         });
    //         return await request(server)
    //             .post('/api/v1/con-token/channels/mychannel/chaincodes/conos')
    //             .set('jwtAuthToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDUxODZkY2VlZjExMzU5NmI3OWM1YjkiLCJpc0FkbWluIjpmYWxzZSwid2FsbGV0QWRkcmVzcyI6IjB4MDdBRUZlNDE0MjgxNDZEMDFkNTk1MzYyNkZDYTQwOEEyYmI1ODc5MiIsImlhdCI6MTYxNTk1NTY5MSwiZXhwIjoxNjQ3NDkxNjkxfQ.W-VdPOsZXtXd1PgL0H8aW-HcNFnqhxOV2N1eJSR0GIE')
    //             .send({
    //                 fcn,
    //                 orgName,
    //                 walletAddress,
    //                 amount,
    //                 signature
    //             });
    //     };

    //     beforeEach(() => {
    //         fcn = 'BurnFrom';
    //         orgName = 'Org1';
    //         walletAddress = '0x07AEFe41428146D01d5953626FCa408A2bb58792';
    //         amount = 10;
    //     });

    //     it('1 - test BurnFrom', async () => {
    //         fcn = '';
    //         orgName = '';
    //         walletAddress = '';
    //         amount = '';
    //         const res = await execute();
    //         console.log('1 - test BurnFrom: ', res.body);
    //         expect(res.status).toBe(400);
    //     });

    //     it('2 - test BurnFrom', async () => {
    //         fcn = 'aaaa';
    //         orgName = 'Org1';
    //         walletAddress = '0x07AEFe41428146D01d5953626FCa408A2bb58792';
    //         amount = 100;
    //         const res = await execute();
    //         console.log('2 - test BurnFrom: ', res.body);
    //         expect(res.status).toBe(400);
    //     });

    //     it('3 - test BurnFrom', async () => {
    //         fcn = 'BurnFrom';
    //         orgName = 'Org1';
    //         walletAddress = new Array(21).join('C');
    //         amount = 100;
    //         const res = await execute();
    //         console.log('3 - test BurnFrom: ', res.body);
    //         expect(res.status).toBe(400);
    //     });
    // });


    setTimeout(function () {
    },  1000)

});