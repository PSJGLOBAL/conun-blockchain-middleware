'use strict';

const { Gateway, Wallets  } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const FabricCAServices = require('fabric-ca-client');
const connectionOrg = require('../helper/conection')
const crypto = require('../../utils/crypto/encryption.algorithm');
const Helper = require("../../common/helper");
const logger = Helper.getLogger("app/helper/token.helper");

const mapOrganizations = new Map();
mapOrganizations.set('Org1', 'ca.org1.conun.io')
mapOrganizations.set('Org2', 'ca.org2.conun.io')


const getUserIdentity = async (arg)  => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(arg.walletAddress);
        if (!identity) return false;

        const connection = await connectionOrg(arg.walletAddress, arg.orgName);
        const gateway = new Gateway();
        await gateway.connect(connection.ccp, connection.connectOptions);

        const caInfo = connection.ccp.certificateAuthorities[mapOrganizations.get(arg.orgName)];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        let adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            logger.info('An identity for the admin user "admin" does not exist in the wallet');
            await enrollAdmin();
            adminIdentity = await wallet.get('admin');
            logger.info("Admin Enrolled Successfully")
        }
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        const identityService = await ca.newIdentityService();

        const retrieveIdentity = await identityService.getOne(arg.walletAddress, adminUser)
        let userWallet = retrieveIdentity.result.id

        await gateway.disconnect();
        return new Promise((resolve, reject) => {
            retrieveIdentity.result.attrs.forEach(obj => {
                if(obj.name === arg.walletType) {
                    let keyStore = crypto.AESDecrypt(obj.value, arg.password)
                    if(keyStore)
                        resolve({
                            walletType: obj.name,
                            walletAddress: userWallet,
                            keyStore: JSON.parse(keyStore)
                        })
                }
            });
            reject(false)
        })
    } catch (error) {
        logger.error(`Getting error: ${error}`)
        return false
    }
}


const importWalletByCertificate = async (arg)  => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(arg.walletAddress);
        if (!identity) {
            await wallet.put(arg.walletAddress, arg.x509Identity);
        }

        const connection = await connectionOrg(arg.walletAddress, arg.orgName);
        const gateway = new Gateway();
        await gateway.connect(connection.ccp, connection.connectOptions);

        const caInfo = connection.ccp.certificateAuthorities[mapOrganizations.get(arg.orgName)];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        let adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            logger.info('An identity for the admin user "admin" does not exist in the wallet');
            await enrollAdmin();
            adminIdentity = await wallet.get('admin');
            logger.info("Admin Enrolled Successfully")
        }
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        const identityService = await ca.newIdentityService();

        const retrieveIdentity = await identityService.getOne(arg.walletAddress, adminUser)
        await gateway.disconnect();

        return retrieveIdentity.result.id;
    } catch (error) {
        logger.error(`Getting error: ${error}`)
        return false
    }
}

// todo get linked wallets
const getLinkedWallets = async (arg)  => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(arg.walletAddress);
        if (!identity) {
            let status = await wallet.put(arg.walletAddress, arg.x509Identity);
            if(!status) return false;
        }

        const connection = await connectionOrg(arg.walletAddress, arg.orgName);
        const gateway = new Gateway();
        await gateway.connect(connection.ccp, connection.connectOptions);

        const caInfo = connection.ccp.certificateAuthorities[mapOrganizations.get(arg.orgName)];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        let adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            logger.info('An identity for the admin user "admin" does not exist in the wallet');
            await enrollAdmin();
            adminIdentity = await wallet.get('admin');
            logger.info("Admin Enrolled Successfully")
        }
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        const identityService = await ca.newIdentityService();

        const retrieveIdentity = await identityService.getOne(arg.walletAddress, adminUser)
        let userWallet = retrieveIdentity.result.id

        await gateway.disconnect();
        return new Promise((resolve, reject) => {
            retrieveIdentity.result.attrs.forEach(obj => {
                if(obj.name === arg.walletType) {
                    let keyStore = crypto.AESDecrypt(obj.value, arg.password)
                    if(keyStore)
                        resolve({
                            walletType: obj.name,
                            walletAddress: userWallet,
                            keyStore: JSON.parse(keyStore)
                        })
                    else reject(false)    
                }
            });
            reject(false)
        })
    } catch (error) {
        logger.error(`Getting error: ${error}`)
        return false
    }
}

const getRegisteredUser = async (arg) => {
    const ccpPath = path.resolve(__dirname, '../../', 'config', 'connection-org1.json');
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
    const ccp = JSON.parse(ccpJSON);

    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities[mapOrganizations.get(arg.orgName)].url;
    const ca = new FabricCAServices(caURL);
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check to see if we've already enrolled the admin user.
    let adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        logger.error('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin();
        adminIdentity = await wallet.get('admin');
        logger.error("Admin Enrolled Successfully");
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: arg.walletAddress, role: 'client' }, adminUser);
    const enrollment = await ca.enroll({ enrollmentID: arg.walletAddress, enrollmentSecret: secret });

    const x509Identity = {
        walletAddress: arg.walletAddress,
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509'
    };

    await wallet.put(arg.walletAddress, x509Identity);
    return x509Identity
}


const enrollAdmin = async () => {
    try {
        const ccpPath = path.resolve(__dirname, '../../', 'config', 'connection-org1.json');
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
        const ccp = JSON.parse(ccpJSON);

        const caInfo = ccp.certificateAuthorities['ca.org1.conun.io'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');
        if (identity) {
            logger.info('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
    } catch (error) {
        logger.error(`Failed to enroll admin user "admin": ${error}`);
    }


}

exports.getRegisteredUser = getRegisteredUser
exports.getLinkedWallets = getLinkedWallets
exports.getUserIdentity = getUserIdentity
exports.importWalletByCertificate = importWalletByCertificate
