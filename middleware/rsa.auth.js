const rsaToken =  require('../middleware/crypto/rsa-signature/index');
var verifyOptions = {
    algorithms: ["RS256"]
}; 
function rsaVerify(req, res, next) {
    rsaToken.verify(req.body.signature, req.user.publicKey, verifyOptions,function(err, decoded) {
        console.log("\n Verified: " + JSON.stringify(decoded));
        if(err) return res.status(400).json({payload: 'not valid signature', success: false,  status: 400 });
        req.body.orgName = decoded.orgName;
        req.body.password = decoded.password;
        req.body.walletType = decoded.walletType;
        next();
    });
}

module.exports = rsaVerify;



// function rsaVerify(req, res, next) {
//     try {
//         const token = req.header('jwtAuthToken');
//             if(!token)
//                 return res.status(401).json({payload: 'auth key required', success: false,  status:  401 });
//             jwt.verify(token, config.get('jwtPrivateKey'), function (err, verify) {
//                 if(err) {
//                     return res.status(400).json({payload: {expiredAt: err.expiredAt}, success: false,  status:  400 });
//                 }
//                 req.user = verify;
//                 console.log('req.user: ', req.user)
//                 next();
//             });
//     } catch (e) {
//             console.log('auth: ', e)
//             return res.status(400).json({payload: e.message, success: false,  status:  400 })
//     }
// }
// module.exports = auth;

