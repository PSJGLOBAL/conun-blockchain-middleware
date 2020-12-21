const request = require('supertest');
const {User, validate} = require('../../models/profile/user');
let server;

describe('USER', () => {

    // beforeEach(() => {
    //     server = require('../../app');
    // });
    //
    // afterEach(() => {
    //     server.close();
    // });


    describe('POST / USER', () => {
        let token;
        let name;
        let email;
        let orgName;
        let password;
        let wallet_address;
        let isAdmin;

        // testlar uchun ishlatiladigan funktsiyani bu yerda oldindan
        // aniqlab olamiz va uni har bir test ichida alohida chaqiramiz
        const execute = async () => {
            return await request(server)
                .post('/api/v1/users')
                .send({
                    token,
                    name,
                    email,
                    orgName,
                    password,
                    wallet_address,
                    isAdmin
                });
        }

        beforeEach(() => {
            name = 'Andrey';
            email = "Andrey@gmail.com";
            orgName = "Org1";
            password = "123456";
            wallet_address = "0xD040495D3720Ec3a551F5A0179B933B8B41ae692";
            isAdmin = false;
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
            const user = await User.find({ name: 'Andrey' });
            expect(user).not.toBeNull();
        });
    });

});