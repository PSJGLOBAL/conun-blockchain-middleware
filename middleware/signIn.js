const NodeRSA = require('node-rsa');

module.exports = async function signIn(req, res, next) {
    let wallet_address = req.body._from || req.body.wallet_address;
    let signedHash = req.body.sign;
    try {
        if (wallet_address === req.user.wallet_address) {
            let publicKey = new NodeRSA(req.user.key);
            delete  req.body.sign;
            let string = JSON.stringify(req.body);
            let status = publicKey.verify(string, signedHash, 'utf8', 'base64');
            if(!status) return res.status(400).send({
                message: 'invalid sign in transaction',
                status: status
            });
            next();
        } else {
            return res.status(400).send({
                message: 'incorrect account holder',
                status: false
            });
        }
    } catch (e) {
        console.log('>> signIn error: ', e);
        return res.status(400).send({
            message: e.message,
            status: false
        });
    }
}