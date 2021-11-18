const rsaToken =  require('../middleware/crypto/rsa-signature/index');
var verifyOptions = {
    algorithms: ["RS256"]
}; 
function rsaVerify(req, res, next) {
    rsaToken.verify(req.body.signature, req.user.publicKey, verifyOptions,function(err, decoded) {
        if(err) return res.status(400).json({payload: 'not valid signature', success: false,  status: 400 });
        req.body.orgName = decoded.orgName;
        req.body.password = decoded.password;
        req.body.walletType = decoded.walletType;
        next();
    });
}

module.exports = rsaVerify;


