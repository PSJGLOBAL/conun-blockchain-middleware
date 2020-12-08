const config = require('config');

module.exports = function () {
    if (!config.get('jwtPrivateKey')) {
        throw new error('STRONG WARNING: jwtPrivateKey is none!');
    }
}