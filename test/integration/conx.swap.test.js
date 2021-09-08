const request = require('supertest');
const path = require('path');
const { Wallets } = require('fabric-network');
const Eth = require('../../app/web3/eth.main');
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


    // describe('POST / admin auth-login', () => {
    //     const execute = async () => {
    //         return await request(server)
    //             .post('/api/v1/admin/auth-login')
    //             .send({
    //                 token,
    //                 oauthType,
    //                 password
    //             });
    //     };
        
    //     beforeEach(() => {
    //         token = adminConfig.token,
    //         oauthType = adminConfig.oauthType,
    //         password = adminConfig.password
    //     });
        
    //     it('1 - send login request', async () => {
    //         const res = await execute();
    //         jwtAuthToken = res.body.payload.jwtAuthToken
    //         x509Identity = res.body.payload.x509Identity
    //         console.log('1 - test Transfer: ', res.body);
    //         expect(res.status).toBe(200);
    //     });
    // });



    // describe('POST / get linked wallet', () => {
    //     const execute = async () => {
    //         return await request(server)
    //             .post('/api/v1/users/getLinkedWallets')
    //             .set('jwtAuthToken', adminConfig.jwtAuthToken)
    //             .send({
    //                 orgName,
    //                 password,
    //                 walletType,
    //                 x509Identity,
    //             });
    //     };
        
    //     beforeEach(() => {
    //         orgName = adminConfig.orgName
    //         password = adminConfig.password
    //         walletType = adminConfig.walletType
    //         x509Identity = adminConfig.x509Identity
    //     });

    //     it('1 - send login request', async () => {
    //         const res = await execute();
    //         console.log('1 - test Transfer: ', res.body);
    //         expect(res.status).toBe(200);
    //     });

    // });



    // key: a4287e0024343dd3b107be1db5ad6fcc7e1413ed50ec32fb68cbb5c2673f1a5d

    // lock: 2e8f93ec34c91e495e6128558a59c3e2a6594e159064a0e3843ae31b0cdb2419





    describe('POST / CONX -> MintAndTransfer', () => {
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



    describe('POST / CONX -> BurnFrom', () => {
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
            fcn = "BurnFrom"
            orgName = adminConfig.orgName
            password = adminConfig.password
            id = "0xa4287e0024343dd3b107be1db5ad6fcc7e1413ed50ec32fb68cbb5c2673f1a5d"
            walletAddress = adminConfig.walletAddress
            amount = "10000"
        });

       
        it('1- CONX Burn', async () => {
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