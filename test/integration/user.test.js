const request = require('supertest');
const {User, validate} = require('../../models/profile/user');
let server;

describe('USER', () => {

    beforeEach(() => {
        server = require('../../app');
    });

    afterEach(() => {
        server.close();
    });


    describe('POST / create', () => {
        let name;
        let email;
        let orgName;
        let password;
        let walletType;

        const execute = async () => {
            return await request(server)
                .post('/api/v1/users/create')
                .send({
                    name,
                    email,
                    orgName,
                    password,
                    walletType
                });
        }

        beforeEach(() => {
            name = 'andrea';
            email = "andrea@gmail.com";
            orgName = "Org1";
            password = "123456";
            walletType = "ETH";
        })

        it('should return 400 if category if name is empty', async () => {
            name = ''
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should return 400 if category name is less than 3 characters', async () => {
            name = '12';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should return 400 if category name is more than 50 characters', async () => {
            name = new Array(52).join('c');
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should save the category if it is valid', async () => {
            await execute();
            const user = await User.find({ name: 'andrea' });
            expect(user).not.toBeNull();
        });
    });


    describe('POST / importEthPk', () => {
        let name;
        let email;
        let orgName;
        let password;
        let walletType;
        let privateKey;

        const execute = async () => {
            return await request(server)
                .post('/api/v1/users/importEthPk')
                .send({
                    name,
                    email,
                    orgName,
                    password,
                    walletType,
                    privateKey
                });
        }

        beforeEach(() => {
            name = 'andrea';
            email = "andrea@gmail.com";
            orgName = "Org1";
            password = "123456";
            walletType = "ETH";
            privateKey = "62cf3e343183c31d509c7eb14fe95c7f9744961c42c93be706875d489fd9e222";
        })

        it('1 should return 400 if category if name is empty', async () => {
            const res = await execute();
            console.log('res', res)
            expect(res.status).toBe(400);
        });

        it('should return 400 if category if name is empty', async () => {
            name = ''
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should return 400 if category name is less than 3 characters', async () => {
            name = '12';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should return 400 if category name is more than 50 characters', async () => {
            name = new Array(52).join('c');
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should save the category if it is valid', async () => {
            await execute();
            const user = await User.find({ name: 'andrea' });
            expect(user).not.toBeNull();
        });
    });

    describe('POST / importWallet', () => {
        let name;
        let email;
        let orgName;
        let password;
        let walletType;
        let x509Identity;

        const execute = async () => {
            return await request(server)
                .post('/api/v1/users/importWallet')
                .send({
                    name,
                    email,
                    orgName,
                    password,
                    walletType,
                    x509Identity
                });
        }

        beforeEach(() => {
            name = 'alfonce';
            email = "alfonce@gmail.com";
            orgName = "Org1";
            password = "123456";
            walletType = "ETH";
            x509Identity = {
                "credentials": {
                    "walletAddress": "0x552A5d618D83031B9445e9D23582cfb9f92DF67E",
                    "certificate": "-----BEGIN CERTIFICATE-----\nMIIE8zCCBJmgAwIBAgIUb8gSarhfhiefPbTJkQ9Z1yVFxqkwCgYIKoZIzj0EAwIw\naDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMt\nY2Etc2VydmVyMB4XDTIxMDMxNTAyMzkwMFoXDTIyMDMxNTAyNDQwMFowZzEwMA0G\nA1UECxMGY2xpZW50MAsGA1UECxMEb3JnMTASBgNVBAsTC2RlcGFydG1lbnQxMTMw\nMQYDVQQDEyoweEQyNGUxNmIxRTA4NEEwZURmMjg0Mzc3ODcyNTY4Q0RDYzdhODgw\nRDYwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASQqVIMX+pA+xXj0C7TdW5uFLx1\nRo4O5nTPpyjuY1/toHV2jTOsxMJfuzNk/fIspz9y+iPu0ENxR9A8TutA2SeHo4ID\nIDCCAxwwDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFBL3\nsngFmFnuKyyHJlNcXwNW871NMB8GA1UdIwQYMBaAFGRsvpDgM5qO11PyAWZfETq6\nDdZyMIICugYIKgMEBQYHCAEEggKseyJhdHRycyI6eyJFVEgiOiJ0eFd1ZndvL0xC\ncW5acnc4NEpqd1FkckpoeGo1WlZPeGR4U0o4b29NdHpmZlAvODJRV2FhS3J2UEJn\nL25GOVJ1Z2lYdnlXcEh1dkw1ZjFlTWJvL1d6SE5ia3JFc2t2eFptMzZZd00zeU5o\nRnZJSGRJWGpScHoxdVQrNWlOK3FNSzhUMDJTc0IzbEtZSXZyemJlTndrb0pxeGNE\nUU5ibWdubU5HQ21UaEJHWkVNMVA2WXdmTzdYTWVudFo5THVES2c3M0Z1ckRJUS9m\ncWVCYmdpMWJHTkhCTTNNTFAxamlpZXNabnZSWWMwd1BvRDhRSmFKc1h6MGFsdjVB\nTS90WVhieGJNWWlQUitsMG1LKzFyTnF6eFVxd05QODRFdlJEVnFvaFU4czNzaDZY\naGg4NGwyQmZhOWlZemFSdndrdTVnQWlXZ21XSTRtTDlkS2xmb3ZUVlV1S1djTmll\nWG9sdDV6S3J4UnJTdVJuQ1ZGazgxcVFCSzJJTVpLeHpObXRYL3hHNHFiZC9sVUF6\nWU5WSnJ5bE44SkVCK1FmcUJOZmszWUx0aEpwSWh2VlpEeUViMTdhbmRTd2RwV2VG\namx3SmdmNW1pZGNYcFM4WkJzVkxMc09CaGVUaVh6RnJ5d0YyamZsYklOdUc4TEpm\nR1JVMHhDZlpTWGl1N29Hb2pUcEYyWTRxc2J0T3hVaUlXNzJnUFlGR0kxT2FXMmRa\neWpvNGZuTEt4N3Bvd1N6ck8rbnlRWUdVVE51azlRUmxjMEhMMVVqN2xUMHdycXNU\nRXJNMUJYam82U2xKZUZsbnd4SzVwU2NPY3E0SGVlcis5TFhJZk14cE5wZjRYMFor\nWDNicHdILzZUWnAxV294MWZXd212aUpHM2wrQT09In19MAoGCCqGSM49BAMCA0gA\nMEUCIQDee6snAcZ5xWa/vmrgtqGmX6kjvZKzag+XN8kgG3QWtQIgZpqOdHMPdAf3\n2PgIZ27jBgvkhZzHNWzuJ2AKKW3rIos=\n-----END CERTIFICATE-----\n",
                    "privateKey": "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgua4SptLnEqmcpylL\r\nIcfl8pFm55BT0Nx1Fd0Yooy0ucihRANCAASQqVIMX+pA+xXj0C7TdW5uFLx1Ro4O\r\n5nTPpyjuY1/toHV2jTOsxMJfuzNk/fIspz9y+iPu0ENxR9A8TutA2SeH\r\n-----END PRIVATE KEY-----\r\n"
                },
                "mspId": "Org1MSP",
                "type": "X.509",
                "linked": {
                    "version": 3,
                    "id": "2c70534d-554b-46c4-ad87-e30fdf56dc72",
                    "address": "d24e16b1e084a0edf284377872568cdcc7a880d6",
                    "crypto": {
                        "ciphertext": "70b717093d2ff22fcd53738eead37eb8159fb162f0a94e64c4aefe5592c61e02",
                        "cipherparams": {
                            "iv": "b2833d09c069df635a292b5cf2780d31"
                        },
                        "cipher": "aes-128-ctr",
                        "kdf": "scrypt",
                        "kdfparams": {
                            "dklen": 32,
                            "salt": "d2f1bca99fd4cdb252b3f9613f20828f8ee421c4bc0b254d0ca018b29ff66904",
                            "n": 8192,
                            "r": 8,
                            "p": 1
                        },
                        "mac": "680d5b1494e959de2888d2b25e240836189fca1d957c96d8d0c07e636cec7589"
                    }
                }
            }
        })

        it('1 should return 400 if category if name is empty', async () => {
            const res = await execute();
            console.log('res', res)
            expect(res.status).toBe(400);
        });

        it('should return 400 if category if name is empty', async () => {
            name = ''
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should return 400 if category name is less than 3 characters', async () => {
            name = '12';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should return 400 if category name is more than 50 characters', async () => {
            name = new Array(52).join('c');
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('should save the category if it is valid', async () => {
            await execute();
            const user = await User.find({ name: 'andrea' });
            expect(user).not.toBeNull();
        });
    });

    setTimeout(function () {
        console.log('test user end')
    },  1000)

});
