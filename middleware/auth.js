const jwt = require('jsonwebtoken');
const config = require('config')


/**
* auth token jwt
* verifying user
* return: {_id, isAdmin, wallet_address, key}
*/
function auth(req, res, next) {
    try {
        const token = req.header('x-auth-token');
            if(!token)
                return res.status(401).json({message: 'auth key required', success: false,  status:  401 })
            req.user = jwt.verify(token, config.get('jwtPrivateKey'));
            console.log('req.user: ', req.user)
            next();
    } catch (e) {
            return res.status(400).json({message: e.message, success: false,  status:  400 })
    }
}


/**
 * check if wallet owner send request
 * verifying wallet
 * return: boolean
 */
function owner(req, res, next) {
    try {
        let walletAddress = req.query.wallet_address || req.body.wallet_address;
        if(walletAddress !== req.user.wallet_address)
            return res.status(400).json({message: 'requester is not owner', success: false,  status:  400 })
        next();
    } catch (e) {
        return res.status(400).json({message: e.message, success: false,  status:  400 })
    }
}

module.exports = auth;
module.exports = owner;

