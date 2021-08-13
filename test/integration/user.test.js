const request = require('supertest');
const NodeRSA = require('node-rsa');
const rsaToken =  require('../../middleware/crypto/rsa-signature/index');
const {User, validate} = require('../../models/profile/user');
let server;

describe('USER', () => {
    let responce = null;
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach(() => {
        server.close();
    });


    describe('POST / importCertificate', () => {
        let orgName;
        let password;
        let x509Identity;

        const execute = async () => {
            return await request(server)
                .post('/api/v1/users/importCertificate')
                .send({
                    orgName,
                    password,
                    x509Identity
                });
        };

        beforeEach(() => {
            orgName = "Org1";
            password = "123456";
            x509Identity = {
                "walletAddress": "0x4b268ac9df32db1ecb7de9751a65923f89c36b6e",
                "credentials": {
                    "certificate": "-----BEGIN CERTIFICATE-----\nMIIE8jCCBJmgAwIBAgIUZ7FKUAJJEGTDUnJJ9wirKip5V4EwCgYIKoZIzj0EAwIw\naDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMt\nY2Etc2VydmVyMB4XDTIxMDgxMjAyMzgwMFoXDTIyMDgxMjAyNDMwMFowZzEwMA0G\nA1UECxMGY2xpZW50MAsGA1UECxMEb3JnMTASBgNVBAsTC2RlcGFydG1lbnQxMTMw\nMQYDVQQDEyoweDRiMjY4YWM5ZGYzMmRiMWVjYjdkZTk3NTFhNjU5MjNmODljMzZi\nNmUwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASBFdL4GSqYQsHDtj5Ees7AHaDy\nTHb0tfa5TquaJM8F4TiQJA8LM3qn13++EEw4D67ISODTLXo8TYOsV2MXNfqHo4ID\nIDCCAxwwDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFGHM\nk+F5uKXvscCzGdnWHMlP0VtuMB8GA1UdIwQYMBaAFGRsvpDgM5qO11PyAWZfETq6\nDdZyMIICugYIKgMEBQYHCAEEggKseyJhdHRycyI6eyJFVEgiOiJ0eFd1ZndvL0xC\ncW5acnc4NEpqd1FTaTU5RHhuaFI5L3c5VG9haHdrVzFqdEFZVW1nejZRR2hNU2d0\nWkhwNWlaNGU0TW1XREdobkFhUkJZV1lmMGVpS2IzK0c0OUZKT0dzMzNEdEpNM0pm\ndGhCdHI2R3FuR21ZU3NLNXB2UU5lelhLZk8rQU03SnBKbFRkbXFrdTVoelA0aGxR\ncElvK3hBbHQ0ZmlISnpTdnRFcWovMjRaWDJiZC9WaE9BaG8zTndGdGg5c0ZJdExW\nZjA1aEcwRC9KcGtXYmZhTmJVbk9SWHlRZzZoV1NoZGdMRFF3QVMwTFRnWktYRVpK\nT1dDTFh2dzA1R1lmcWNML1VvRU9iVmpsekJTeGxUdHBuS1ZWVEs5bWhQTkZINk9a\nWE45T016Ukg1VDFBZjUvTlVCOUpONEdWTW52MnU1S3VySlk3bHBxSE80QkhJc3FM\nSmk5bGQxeXpUb2k5SjhHc3FmeVBhZFdUZmovdEkxUkRHdUpkSXZVQ01EUlBsYzhF\nYTd4SFpseTJKaVBKSXRIT04wR2RYaU1RcnpXUTI1YUh2U2dUVnA1ZHB2SHlyeExD\nckdZdkMyQ1hSejUxNzE1THRlNDhqMWpOS0lNWWludGhIMVJwb0lxdytaYUdGcXRR\nc2dzemloOVRDSi9JVVUzS1J2bDNLUUd5R3lnd2IxOTk4UzhTL0xrcUZtWkhuSHox\nWmFIS2ozS2NOaUhhNnlsTFRpL1BTb3MycG01SlJnK3ZkZmVzNDJXWi8xMmlOMkxt\naE1RZmdhcHhielR5cExhcjJqdFpSUzVYVy9wQ0dNeDlnbEVTODAxL0lyUXd2N29F\nU1FKN2RDVXhuWEtqZytUSDdnV09Ya3kzaW9NZz09In19MAoGCCqGSM49BAMCA0cA\nMEQCIBncSaHYKNJ0nWnO9anHxIxyBLKakZfqlUW35pPz9k8kAiAcpF87MPQd8Uwd\nFyf1+UC11KP3okZMJ0JrJUEm8XBy+A==\n-----END CERTIFICATE-----\n",
                    "privateKey": "-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgeCDj6FXHbNu61VN1\r\nH55C+WJXAOyH4U/QGl2WpR/5vUGhRANCAASBFdL4GSqYQsHDtj5Ees7AHaDyTHb0\r\ntfa5TquaJM8F4TiQJA8LM3qn13++EEw4D67ISODTLXo8TYOsV2MXNfqH\r\n-----END PRIVATE KEY-----\r\n"
                },
                "mspId": "Org1MSP",
                "type": "X.509"
            };
        });

        it('1.', async () => {
            const res = await execute();
            responce = res.body.payload;
            console.log('importCertificate: ', responce);
            expect(res.status).toBe(200);
        });
    });


    describe('POST / getLinkedWallets', () => {
        let signature;
        var signOptions = {
            expiresIn: '90000ms',
            algorithm: "RS256"
          };

        const execute = async () => {
            return await request(server)
                .post('/api/v1/users/getLinkedWallets')
                .set({'jwtAuthToken': `${responce.jwtAuthToken}`})
                .send({
                    signature
                });
        };

        beforeEach(() => {
            signature = rsaToken.sign({
                orgName: "Org1",
                password: "123456",
                walletType: 'ETH'
            }, responce.rsa.privateKey, signOptions);
            console.log('signature: ', signature);
        });

        it('1.', async () => {
            const res = await execute();
            responce = res.body.payload;
            console.log('getLinkedWallets: ', responce);
            expect(res.status).toBe(200);
        });
    });

    setTimeout(function () {
    },  5000)

});
