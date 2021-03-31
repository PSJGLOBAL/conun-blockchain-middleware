const path = require('path');
const request = require('supertest');
const {User, validate} = require('../../models/profile/user');

const { Certificate, PrivateKey } = require('@fidm/x509');
const { Wallets } = require('fabric-network');
const jwt = require('jsonwebtoken');

let server;

async function sign(walletAddress,  payload) {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(walletAddress);
        if(!identity) return;
        // console.log('identity.credentials.privateKey: ', identity.credentials.privateKey);
        const privateKey = PrivateKey.fromPEM(identity.credentials.privateKey);
        // console.log('> privateKey: ', privateKey);
        const signature = privateKey.sign(Buffer.from(JSON.stringify(payload)), 'sha256');
        // console.log('> signature: ', signature);
        let sign = jwt.sign({signature: signature.toString('base64')}, identity.credentials.privateKey, { expiresIn: '19000ms' });
        console.log('sign: ', sign);

        return sign;
    } catch (e) {
        console.log('>> signIn error: ', e);
    }
}

describe('INVOKE CONX', () => {
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach(() => {
        server.close();
    });

    describe('POST / Transfer', () => {
        let fcn;
        let orgName;
        let fromAddress;
        let toAddress;
        let value;
        let signature;

        const execute = async () => {
            signature = await sign(fromAddress, {
                fcn,
                orgName,
                fromAddress,
                toAddress,
                value
            });
            return await request(server)
                .post('/api/v1/con-token/channels/mychannel/chaincodes/conos')
                .set('x-auth-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDYyYzE2ZmNhYzY5YjM2MTM4MGM2OWYiLCJpc0FkbWluIjpmYWxzZSwid2FsbGV0QWRkcmVzcyI6IjB4RWNmOGY3NDdCOWZFMzRmMjg2RWNkQUI2RTNDNkIyRDYwNzBkNTRBQSIsImlhdCI6MTYxNzA5MzcwNywiZXhwIjoxNjQ4NjI5NzA3fQ.gPuKm3XQ8yJvlyF_VVM7RgV2TiWPayVPswA4DLrn5GE')
                .send({
                    fcn,
                    orgName,
                    fromAddress,
                    toAddress,
                    value,
                    signature
                });
        };

        beforeEach(() => {
                fcn = 'Transfer';
                orgName = 'Org1';
                fromAddress = '0xEcf8f747B9fE34f286EcdAB6E3C6B2D6070d54AA';
                toAddress = '0x44DAdf6479eC63Ebdd830417212055899Ab28142';
                value = 0;
        });

        it('1 - test Transfer', async () => {
            fcn = '';
            orgName = '';
            fromAddress = '';
            toAddress = '';
            value = '';
            const res = await execute();
            console.log('1 - test Transfer: ', res.body);
            expect(res.status).toBe(400);
        });

        it('2 - test Transfer', async () => {
            fcn = 'aaaa';
            orgName = 'Org1';
            fromAddress = '0xEcf8f747B9fE34f286EcdAB6E3C6B2D6070d54AA';
            toAddress = ''
            value = 0.1
            const res = await execute();
            console.log('2 - test Transfer: ', res.body);
            expect(res.status).toBe(400);
        });

        it('3 - test Transfer', async () => {
            fcn = 'Transfer';
            orgName = 'Org1';
            fromAddress = new Array(21).join('X');
            toAddress = '0x44DAdf6479eC63Ebdd830417212055899Ab28142';
            value = 0.2;
            const res = await execute();
            console.log('3 - test Transfer: ', res.body);
            expect(res.status).toBe(400);
        });

        it('4 - test Transfer', async () => {
            await execute();
            const user = await User.findOne({ walletAddress: '0xEcf8f747B9fE34f286EcdAB6E3C6B2D6070d54AA' });
            console.log('4 - test Transfer: ', user.email);
            expect(user).not.toBeNull();
        });
    });


    describe('POST / Mint', () => {
        let fcn;
        let orgName;
        let walletAddress;
        let amount;
        let signature;

        const execute = async () => {
            signature = await sign(walletAddress, {
                fcn,
                orgName,
                walletAddress,
                amount
            });
            return await request(server)
                .post('/api/v1/con-token/channels/mychannel/chaincodes/conos')
                .set('x-auth-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDUxODZkY2VlZjExMzU5NmI3OWM1YjkiLCJpc0FkbWluIjpmYWxzZSwid2FsbGV0QWRkcmVzcyI6IjB4MDdBRUZlNDE0MjgxNDZEMDFkNTk1MzYyNkZDYTQwOEEyYmI1ODc5MiIsImlhdCI6MTYxNTk1NTY5MSwiZXhwIjoxNjQ3NDkxNjkxfQ.W-VdPOsZXtXd1PgL0H8aW-HcNFnqhxOV2N1eJSR0GIE')
                .send({
                    fcn,
                    orgName,
                    walletAddress,
                    amount,
                    signature
                });
        };

        beforeEach(() => {
            fcn = 'Mint';
            orgName = 'Org1';
            walletAddress = '0x07AEFe41428146D01d5953626FCa408A2bb58792';
            amount = 10;
        });

        it('1 - test Mint', async () => {
            fcn = '';
            orgName = '';
            walletAddress = '';
            amount = '';
            const res = await execute();
            console.log('1 - test Mint: ', res.body);
            expect(res.status).toBe(400);
        });

        it('2 - test Mint', async () => {
            fcn = 'aaaa';
            orgName = 'Org1';
            walletAddress = '0x07AEFe41428146D01d5953626FCa408A2bb58792';
            amount = 100;
            const res = await execute();
            console.log('2 - test Mint: ', res.body);
            expect(res.status).toBe(400);
        });

        it('3 - test Mint', async () => {
            fcn = 'Mint';
            orgName = 'Org1';
            walletAddress = new Array(21).join('C');
            amount = 100;
            const res = await execute();
            console.log('3 - test Mint: ', res.body);
            expect(res.status).toBe(400);
        });

        it('4 - test Mint', async () => {
            const res = await execute();
            console.log('4 - test Mint: ', res.body);
            expect(res.status).toBe(200);
        });
    });


    describe('POST / Burn', () => {
        let fcn;
        let orgName;
        let walletAddress;
        let amount;
        let signature;

        const execute = async () => {
            signature = await sign(walletAddress, {
                fcn,
                orgName,
                walletAddress,
                amount
            });
            return await request(server)
                .post('/api/v1/con-token/channels/mychannel/chaincodes/conos')
                .set('x-auth-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDUxODZkY2VlZjExMzU5NmI3OWM1YjkiLCJpc0FkbWluIjpmYWxzZSwid2FsbGV0QWRkcmVzcyI6IjB4MDdBRUZlNDE0MjgxNDZEMDFkNTk1MzYyNkZDYTQwOEEyYmI1ODc5MiIsImlhdCI6MTYxNTk1NTY5MSwiZXhwIjoxNjQ3NDkxNjkxfQ.W-VdPOsZXtXd1PgL0H8aW-HcNFnqhxOV2N1eJSR0GIE')
                .send({
                    fcn,
                    orgName,
                    walletAddress,
                    amount,
                    signature
                });
        };

        beforeEach(() => {
            fcn = 'Burn';
            orgName = 'Org1';
            walletAddress = '0x07AEFe41428146D01d5953626FCa408A2bb58792';
            amount = 10;
        });

        it('1 - test Burn', async () => {
            fcn = '';
            orgName = '';
            walletAddress = '';
            amount = '';
            const res = await execute();
            console.log('1 - test Burn: ', res.body);
            expect(res.status).toBe(400);
        });

        it('2 - test Burn', async () => {
            fcn = 'aaaa';
            orgName = 'Org1';
            walletAddress = '0x07AEFe41428146D01d5953626FCa408A2bb58792';
            amount = 100;
            const res = await execute();
            console.log('2 - test Burn: ', res.body);
            expect(res.status).toBe(400);
        });

        it('3 - test Burn', async () => {
            fcn = 'Burn';
            orgName = 'Org1';
            walletAddress = new Array(21).join('C');
            amount = 100;
            const res = await execute();
            console.log('3 - test Burn: ', res.body);
            expect(res.status).toBe(400);
        });
    });


    setTimeout(function () {
    },  1000)

});