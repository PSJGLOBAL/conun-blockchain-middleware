const path = require('path');
const { Certificate, PrivateKey } = require('@fidm/x509')
const { Wallets } = require('fabric-network');
const jwt = require('jsonwebtoken');

const verify = async (req, res, next) => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(req.use.walletAddress);
        if (!identity) return res.status(400).json({
            payload: `Your wallet with this address ${req.use.walletAddress} not active, please import and try again`,
            success: false,
            status: 400
        });
        const ed25519Cert = Certificate.fromPEM(identity.credentials.certificate);
        let signToken = req.body.signature;
        delete req.body.signature;

        jwt.verify(signToken, identity.credentials.privateKey, function (err, verify) {
            if(err) return res.status(401).json({
                payload: 'one time signature has been expired, try again',
                success: false,
                status: 401
            });

            console.log('verify: ', verify)
            let status = ed25519Cert.publicKey.verify(Buffer.from(JSON.stringify(req.body)), verify.signature, 'sha256');
            if(!status) return res.status(401).json({
                payload: 'verification failed please try again',
                success: false,
                status: 401
            });
        });
        next();
    } catch (e) {
        console.log('>> signIn error: ', e);
        res.status(401).json({
            payload: 'invalid key pair',
            success: false,
            status: 401
        });
    }
}


const sign = async (walletAddress,  payload) => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(walletAddress);
        const privateKey = PrivateKey.fromPEM(identity.credentials.privateKey)
        const signature = privateKey.sign(Buffer.from(JSON.stringify(payload)), 'sha256')
        return  jwt.sign({signature: signature.toString('base64')}, identity.credentials.privateKey, { expiresIn: '1000ms' });
    } catch (e) {
        console.log('>> signIn error: ', e);
    }
}

exports.verify = verify
exports.sign = sign
