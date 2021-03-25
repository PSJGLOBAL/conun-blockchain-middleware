const path = require('path');
const { Certificate, PrivateKey } = require('@fidm/x509')
const { Wallets } = require('fabric-network');
const jwt = require('jsonwebtoken');

/*
* Features of x509 Signature: It is based on Hashed Timelock, user wallet that makes it a timebound transaction
* sign to transaction with x509.
* this signature making with owner`s private key.
* making unique transaction.
* lifetime, expired time.
* */

const verify = async (req, res, next) => {
    try {
        console.log('1 >> req: ', req.body)
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(req.user.walletAddress);
        if (!identity) return res.status(400).json({
            payload: `Your wallet with this address ${req.user.walletAddress} not active, please import and try again`,
            success: false,
            status: 400
        });
        const ed25519Cert = Certificate.fromPEM(identity.credentials.certificate);
        let signToken = req.body.signature;
        delete req.body.signature;

        jwt.verify(signToken, identity.credentials.privateKey, function (err, verify) {
            if(err) return res.status(401).json({
                payload: `one time signature has been expired, try again`,
                success: false,
                status: 401
            });

            let status = ed25519Cert.publicKey.verify(Buffer.from(JSON.stringify(req.body)), Buffer.from(verify.signature, 'base64'), 'sha256');
            if(!status) {
                return res.status(401).json({
                    payload: 'verification failed please try again',
                    success: false,
                    status: 401
                });
            } else next();
        });
    } catch (e) {
        console.log('>> signIn error: ', e);
        res.status(401).json({
            payload: 'invalid key pair',
            success: false,
            status: 401
        });
    }
}

exports.verify = verify

/*
       * get private key from your wallet ->  PrivateKey.fromPEM(credentials.privateKey)
       * make signature with x509. Add your post request 'payload' data in  -> privateKey.sign(payload)
       * make lifetime signature with jwt -> { expiresIn: '1000ms' }
*/

const sign = async (walletAddress,  payload) => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(walletAddress);
        console.log('identity.credentials.privateKey: ', identity.credentials.privateKey)
        const privateKey = PrivateKey.fromPEM(identity.credentials.privateKey);
        console.log('> privateKey: ', privateKey)
        const signature = privateKey.sign(Buffer.from(JSON.stringify('payload')), 'sha256')
        console.log('> signature: ', signature)
        let sign = jwt.sign({signature: signature.toString('base64')}, identity.credentials.privateKey, { expiresIn: '1000ms' });

        console.log('sign: ', sign)

    } catch (e) {
        console.log('>> signIn error: ', e);
    }
}
