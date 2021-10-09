module.exports = function () {
    if (!process.env.JWT_PRIVATE_KEY) {
        throw new error('STRONG WARNING: jwtPrivateKey is none!');
    }
}