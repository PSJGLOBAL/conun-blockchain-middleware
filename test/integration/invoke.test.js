const request = require('supertest');
const {User, validate} = require('../../models/profile/user');
let server;

describe('INVOKE', () => {
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach(() => {
        server.close();
    });

    describe('POST / BalanceOf', () => {
        let fcn;
        let wallet_address;
        let orgName;

        const execute = async () => {
            return await request(server)
                .post('/api/v1/invoke/channels/mychannel/chaincodes/token')
                .set('x-auth-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmQwNTBjM2Y2YmFjYzQxNjZhZGQ4ZjUiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjA3NDg3NzUxfQ.lvee460oHn4-NgICHTwrIixKP2rfcnbLlQafaZDXkvE')
                .send({
                    fcn,
                    orgName,
                    wallet_address
                });
        }

        beforeEach(() => {
                fcn = 'BalanceOf';
                orgName = 'Org1';
                wallet_address = '0X06AFFAC583D04E9367FC02F265FE55D6800B0A14';
        })

        it('1 - should return 400 if category if name is empty', async () => {
            fcn = ''
            orgName = ''
            wallet_address = ''
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('2 - if fcn name is not exist should return  400', async () => {
            fcn = 'aaaa'
            orgName = 'Org1'
            wallet_address = '0X06AFFAC583D04E9367FC02F265FE55D6800B0A14'
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('3 - not exiting wallet should return 400', async () => {
            fcn = 'BalanceOf'
            orgName = 'Org1'
            wallet_address = new Array(21).join('c');
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('4 - should save the category if it is valid', async () => {
            await execute();
            const user = await User.find({ wallet_address: '0X06AFFAC583D04E9367FC02F265FE55D6800B0A14' });
            expect(user).not.toBeNull();
        });
    });

});