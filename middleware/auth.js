const jwt = require('jsonwebtoken');
const config = require('config')

module.exports = function auth(req, res, next) {
    try {
    const token = req.header('x-auth-token');
    if(!token)
        return res.status(401).send('auth token none');
        req.user = jwt.verify(token, config.get('jwtPrivateKey'));
        console.log('req.user: ', req.user);
        next();
    } catch (e) {
        return res.status(401).send('Invalid token');
    }
}