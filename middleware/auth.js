const jwt = require('jsonwebtoken');
const config = require('config')

module.exports = function auth(req, res, next) {
    try {
        const token = req.header('x-auth-token');
            if(!token)
                return res.status(401).json({message: 'auth key required', success: false,  status:  401 })
            req.user = jwt.verify(token, config.get('jwtPrivateKey'));
            next();
        } catch (e) {
            return res.status(400).json({message: e.message, success: false,  status:  400 })
        }
}