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

    describe('POST / Transfer', () => {
        let fcn;
        let orgName;
        let _from;
        let to;
        let value;

        const execute = async () => {
            return await request(server)
                .post('/api/v1/con-token/channels/mychannel/chaincodes/conToken')
                .set('x-auth-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmQwNTBjM2Y2YmFjYzQxNjZhZGQ4ZjUiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNjA3NDg3NzUxfQ.lvee460oHn4-NgICHTwrIixKP2rfcnbLlQafaZDXkvE')
                .send({
                    fcn,
                    orgName,
                    _from,
                    to,
                    value
                });
        }

        beforeEach(() => {
                fcn = 'Transfer';
                orgName = 'Org1';
                _from = '0xAE040495D3720Ec3a551F5A0179B933B8B41ae458';
                to = '0xD040495D3720Ec3a551F5A0179B933B8B41ae244';
                value = 10;
        })

        it('1 - test', async () => {
            fcn = '';
            orgName = '';
            _from = '';
            to = '';
            value = '';
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('2 - test', async () => {
            fcn = 'aaaa'
            orgName = 'Org1'
            _from = '0xAE040495D3720Ec3a551F5A0179B933B8B41ae458'
            to = ''
            value = 10
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('3 - test', async () => {
            fcn = 'Transfer'
            orgName = 'Org1'
            _from = new Array(21).join('X');
            to = '0xD040495D3720Ec3a551F5A0179B933B8B41ae244'
            value = 10
            const res = await execute();
            expect(res.status).toBe(400);
        });

        it('4 - test', async () => {
            await execute();
            const user = await User.find({ wallet_address: '0X06AFFAC583D04E9367FC02F265FE55D6800B0A14' });
            expect(user).not.toBeNull();
        });
    });

});