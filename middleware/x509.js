const path = require('path');
const { Certificate, PrivateKey } = require('@fidm/x509')
const { Wallets } = require('fabric-network');

const verify = async (req, res, next) => {
    try {
        // const walletPath = path.join(process.cwd(), 'wallet');
        // const wallet = await Wallets.newFileSystemWallet(walletPath);
        // let identity = await wallet.get(req.use.walletAddress);
        // if (!identity) return false;
        // const ed25519Cert = Certificate.fromPEM(identity.credentials.certificate);
        // let signature = req.body.signature;
        // delete req.body.signature;
        // let verify = ed25519Cert.publicKey.verify(Buffer.from(JSON.stringify(req.body)), signature, 'sha256');
        // if(!verify) return res.status(400).json({
        //     payload: 'verification failed please try again',
        //     success: false,
        //     status: 400
        // });
        next();
    } catch (e) {
        console.log('>> signIn error: ', e);
        res.status(400).json({
            payload: 'invalid key pair',
            success: false,
            status: 400
        });
    }
}


const sign = async (req, res, next) => {
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`connectionOrg Wallet path: ${walletPath}`);

        // // Check to see if we've already enrolled the user.
        let identity = await wallet.get('0xD24e16b1E084A0eDf284377872568CDCc7a880D6');
        console.log('identity: ', identity)
        console.log('certificate: ', identity.credentials.certificate)
        console.log('privateKey: ', identity.credentials.privateKey)

        const ed25519Cert = Certificate.fromPEM(identity.credentials.certificate)
        const privateKey = PrivateKey.fromPEM(identity.credentials.privateKey)
        const data = Buffer.allocUnsafe(100)
        const signature = privateKey.sign(data, 'sha256')
        console.log(ed25519Cert.publicKey.verify(data, signature, 'sha256')) // true
        return res.status(200);
    } catch (e) {
        console.log('>> signIn error: ', e);
        return res.status(400);
    }
}

exports.verify = verify
exports.sign = sign
