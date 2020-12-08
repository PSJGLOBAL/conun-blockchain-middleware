const jwt = require('jsonwebtoken');
const config = require('config')

module.exports = function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if(!token)
        return res.status(401).send('auth token none');

    try {
        req.user = jwt.verify(token, config.get('jwtPrivateKey'));
        next();
    } catch (e) {
        return res.status(400).send('Invalid token');
    }
}