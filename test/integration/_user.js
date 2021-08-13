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
        };

        beforeEach(() => {
            name = 'andrea';
            email = "andrea@gmail.com";
            orgName = "Org1";
            password = "123456";
            walletType = "ETH";
        });

        it('1. Name is empty', async () => {
            name = '';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('2. Name is more than 50 characters', async () => {
            name = new Array(52).join('c');
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('3. Name is valid', async () => {
            await execute();
            const user = await User.findOne({ name: 'andrea' });
            expect(user).not.toBeNull();
        });

        it('4. Email is empty', async () => {
            email = '';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('5. Email is valid', async () => {
            await execute();
            const user = await User.findOne({ email: 'conus@gmail.com' });
            expect(user).not.toBeNull();
        });

        it('6. Email is invalid', async () => {
            await execute();
            const user = await User.findOne({ email: 'xxxxxx@gmail.com' });
            expect(user).toBeNull();
        });

        it('7. orgName is empty', async () => {
            orgName = '';
            const res = await execute();
            console.log('7. orgName', res.body);
            expect(res.status).toBe(400);
        });

        it('8. orgName is different', async () => {
            orgName = 'AAAA';
            const res = await execute();
            console.log('8. orgName', res.body);
            expect(res.status).toBe(400);
        });

        it('9. Password is empty', async () => {
            password = '';
            const res = await execute();
            console.log('9. Password', res.body);
            expect(res.status).toBe(400);
        });

        it('10. walletType is empty', async () => {
            walletType = '';
            const res = await execute();
            console.log('10. walletType', res.body);
            expect(res.status).toBe(400);
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
        };

        beforeEach(() => {
            name = 'andrea';
            email = "andrea@gmail.com";
            orgName = "Org1";
            password = "123456";
            walletType = "ETH";
            privateKey = "62cf3e343183c31d509c7eb14fe95c7f9744961c42c93be706875d489fd9e222";
        });

        it('1. Name is empty', async () => {
            name = '';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('2. Name is more than 50 characters', async () => {
            name = new Array(52).join('c');
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('3. Name is valid', async () => {
            await execute();
            const user = await User.findOne({ name: 'andrea' });
            expect(user).not.toBeNull();
        });

        it('4. Email is empty', async () => {
            email = '';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('5. Email is valid', async () => {
            await execute();
            const user = await User.findOne({ email: 'conus@gmail.com' });
            expect(user).not.toBeNull();
        });

        it('6. Email is invalid', async () => {
            await execute();
            const user = await User.findOne({ email: 'xxxxxx@gmail.com' });
            expect(user).toBeNull();
        });

        it('7. orgName is empty', async () => {
            orgName = '';
            const res = await execute();
            console.log('7. orgName', res.body);
            expect(res.status).toBe(400);
        });

        it('8. orgName is different', async () => {
            orgName = 'AAAA';
            const res = await execute();
            console.log('8. orgName', res.body);
            expect(res.status).toBe(400);
        });

        it('9. Password is empty', async () => {
            password = '';
            const res = await execute();
            console.log('9. Password', res.body);
            expect(res.status).toBe(400);
        });

        it('10. walletType is empty', async () => {
            walletType = '';
            const res = await execute();
            console.log('11. privateKey', res.body);
            expect(res.status).toBe(400);
        });

        it('11. privateKey is invalid', async () => {
            walletType = 'AAAA1234567899AAA';
            const res = await execute();
            console.log('12. privateKey', res.body);
            expect(res.status).toBe(400);
        });
        it('12. Execute', async () => {
            const res = await execute();
            console.log('12 Execute: ', res.body);
            expect(res.status).toBe(400);
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
        };

        beforeEach(() => {
            name = 'jest_test';
            email = "jest_test@gmail.com";
            orgName = "Org1";
            password = "123456";
            walletType = "ETH";
            x509Identity = {
                "walletAddress": "0xEcf8f747B9fE34f286EcdAB6E3C6B2D6070d54AA",
                "credentials": {
                    "certificate": "-----BEGIN CERTIFICATE-----\nMIIE8jCCBJmgAwIBAgIUK/FnJqUxkM36F5KKhAHQz6Mt73gwCgYIKoZIzj0EAwIw\naDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMt\nY2Etc2VydmVyMB4XDTIxMDMzMDA2MDgwMFoXDTIyMDMzMDA2MTMwMFowZzEwMA0G\nA1UECxMGY2xpZW50MAsGA1UECxMEb3JnMTASBgNVBAsTC2RlcGFydG1lbnQxMTMw\nMQYDVQQDEyoweEVjZjhmNzQ3QjlmRTM0ZjI4NkVjZEFCNkUzQzZCMkQ2MDcwZDU0\nQUEwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASP0x87zYwM7pi8mkVKIx0uZnRO\n7SFeJcaR8f2owyEtXnTiilRxR5aFo2eZUOZcT7X1Fr8wTrdJyKGJxxnQHvsso4ID\nIDCCAxwwDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFPUd\nBXdYGwF7alaXvlX+Jkny/IFGMB8GA1UdIwQYMBaAFGRsvpDgM5qO11PyAWZfETq6\nDdZyMIICugYIKgMEBQYHCAEEggKseyJhdHRycyI6eyJFVEgiOiJ0eFd1ZndvL0xC\ncW5acnc4NEpqd1FRWDlyZFIrZDRIeHNqd1hjVTZGb0dwaTB5cFBmQTltTHNIOUFt\nNUZRaGNHTEUwWWdlUmQ1U3dzbFdRbit3dDhOc2k4dUs1L1FZQWFzL09QMWJCMDVO\nanJXVXVUTmVGTk15UUJZSzI0QXF1aWx0MVVGdHovbWVjclFmeFhwb2Jvd1hGUkFS\nbDJteHlPK0tLVnNMTVMwRXFmK09ZQ29OS2QySVBGdDRZbjVZcTdlUzN4MG9lS0xG\nVzhTTFNMb2YySXNySU04VkpIOFJrUXJnbmRTODcyY3JMb2ZUMXNJVzd2MEwyYjRZ\nbjI4RUNwS3BObUdqbmJXeGtSRFNoUVlGL2IyaFEwSVlrZzl0dGZYN1ZGc3dzaGJh\nL1JVLzRWNm9LajZnK2N2eExYVW5EV3N3TklJd1ptUXZVZnZGV01rR0Z2TmJ4MTJE\nN1VnVU5QYWFEV05VN04yWlA1Mk9zdXVuendlUjFiUEg1VDQxdDhWd1ZWN1NCaFZ6\ndmVKblc3RktlQVY4aERhT29LRW51NHB6bjR6ZEFCM3U2Zk5adnRzcjE2MXJRMkVU\nL1JvamFmN2FXOWFnQXpUMFFVb1kyNFZqZkEzM2tjM3VEeStQbmx0anV6VGoyYVZx\nMloxcWcwZEQ1aVJWT2dvUjloZTVZU0RlZFJrTWZ6S0p1YkNKbFhORnlTd0hiVjRp\nTHMvOU5uV0ZsM3pMcjVIc2huR3dhVkNsMjYvMEI2Tmk2VGIvOU1BWEdtWGlJSnl1\nUnYxcXRETTluK09pRjVrNytCRHhmNTgvS1J2UTFwM1lkZWRQYTc0UFJXbzcxVkFT\naTR6RWY1YnJTcGk1WTlFWU9tVDRCZmwvc0JKQT09In19MAoGCCqGSM49BAMCA0cA\nMEQCIDbI0GHcdlVm22tnyjX2EOkc5NhVppI/TdE+9gmFafD/AiABE/uznT1IYGNU\n6dGeemrP2AaA55kOWJ80Yh8/CUoOFw==\n-----END CERTIFICATE-----\n",
                    "privateKey": "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgKko47pakqXG9hZh1\r\nA2NXm6GHnUKj+f2IikgRtG+Av7uhRANCAASP0x87zYwM7pi8mkVKIx0uZnRO7SFe\r\nJcaR8f2owyEtXnTiilRxR5aFo2eZUOZcT7X1Fr8wTrdJyKGJxxnQHvss\r\n-----END PRIVATE KEY-----\r\n"
                },
                "mspId": "Org1MSP",
                "type": "X.509",
                "linked": {
                    "version": 3,
                    "id": "150d90a5-17c8-4dab-a51c-b1432395fb1c",
                    "address": "ecf8f747b9fe34f286ecdab6e3c6b2d6070d54aa",
                    "crypto": {
                        "ciphertext": "b7d6dd306c039ef44ea991fe9aa84780f2917bd1130b2fbdc526db68f14cc4b6",
                        "cipherparams": {
                            "iv": "996bc85593e53bb043d723facec822fd"
                        },
                        "cipher": "aes-128-ctr",
                        "kdf": "scrypt",
                        "kdfparams": {
                            "dklen": 32,
                            "salt": "eb5db1b6d9531ab3906aeae558aa49a7e7e4b0743f77d5e0a39efca7265aa1c1",
                            "n": 8192,
                            "r": 8,
                            "p": 1
                        },
                        "mac": "4c2adfa91e921d7f3989a758ceb8f19fcca601a95cd7057e9c6909bc248c0d0f"
                    }
                }
            }
        })
        it('1. Name is empty', async () => {
            name = '';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('2. Name is more than 50 characters', async () => {
            name = new Array(52).join('c');
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('3. Name is valid', async () => {
            await execute();
            const user = await User.findOne({ name: 'andrea' });
            expect(user).not.toBeNull();
        });

        it('4. Email is empty', async () => {
            email = '';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('5. Email is valid', async () => {
            await execute();
            const user = await User.findOne({ email: 'conus@gmail.com' });
            expect(user).not.toBeNull();
        });

        it('6. Email is invalid', async () => {
            await execute();
            const user = await User.findOne({ email: 'xxxxxx@gmail.com' });
            expect(user).toBeNull();
        });

        it('7. orgName is empty', async () => {
            orgName = '';
            const res = await execute();
            console.log('7. orgName', res.body);
            expect(res.status).toBe(400);
        });

        it('8. orgName is different', async () => {
            orgName = 'AAAA';
            const res = await execute();
            console.log('8. orgName', res.body);
            expect(res.status).toBe(400);
        });

        it('9. Password is empty', async () => {
            password = '';
            const res = await execute();
            console.log('9. Password', res.body);
            expect(res.status).toBe(400);
        });

        it('10. Password is invalid', async () => {
            password = '4554645';
            const res = await execute();
            console.log('9. Password', res.body);
            expect(res.status).toBe(400);
        });

        it('11. x509Identity is empty', async () => {
            x509Identity = '';
            const res = await execute();
            console.log('10. walletType', res.body);
            expect(res.status).toBe(400);
        });

        it('12. x509Identity is invalid', async () => {
            x509Identity = 'AAAA1234567899AAA';
            const res = await execute();
            console.log('12. privateKey', res.body);
            expect(res.status).toBe(400);
        });

        it('13. Execute', async () => {
            const res = await execute();
            console.log('13 Execute: ', res.body);
            expect(res.status).toBe(200);
        });
    });

    setTimeout(function () {
    },  1000)

});
