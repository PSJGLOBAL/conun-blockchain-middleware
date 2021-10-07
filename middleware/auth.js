const jwt = require('jsonwebtoken');
/**
* auth token jwt
* verifying user
* return: {_id, isAdmin, wallet_address, key}
*/

function auth(req, res, next) {
    try {
        const token = req.header('jwtAuthToken');
            if(!token)
                return res.status(401).json({payload: 'auth key required', success: false,  status:  401 });
            jwt.verify(token, process.env.JWT_PRIVATE_KEY, function (err, verify) {
                if(err) {
                    return res.status(400).json({payload: {expiredAt: err.expiredAt}, success: false,  status:  400 });
                }
                req.user = verify;
                next();
            });
    } catch (e) {
            console.log('auth: ', e)
            return res.status(400).json({payload: e.message, success: false,  status:  400 })
    }
}
module.exports = auth;

