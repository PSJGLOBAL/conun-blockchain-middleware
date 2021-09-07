const request = require('supertest');
const path = require('path');
const { Wallets } = require('fabric-network');
const adminConfig = require('./private.json'); 

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


describe('BRIDGE SWAP', () => {
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach(() => {
        server.close();
    });
    
    describe('POST / admin auth-login', () => {
        const execute = async () => {
            return await request(server)
                .post('/api/v1/admin/auth-login')
                .send({
                    token,
                    oauthType,
                    password
                });
        };
        
        beforeEach(() => {
            token = adminConfig.token,
            oauthType = adminConfig.oauthType,
            password = adminConfig.password
        });

    it('1 - send login request', async () => {
        const res = await execute();
        console.log('1 - test Transfer: ', res.body);
        expect(res.status).toBe(401);
    });

    });

    setTimeout(function () {
    },  1000)

});