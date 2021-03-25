'use strict';

const { Gateway, Wallets  } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const FabricCAServices = require('fabric-ca-client');
const connectionOrg = require('../helper/conection')
const crypto = require('../../utils/crypto/encryption.algorithm');

const mapOrganizations = new Map();
mapOrganizations.set('Org1', 'ca.org1.example.com')
mapOrganizations.set('Org2', 'ca.org2.example.com')


const getUserIdentity = async (arg)  => {
    try {
        console.log('arg : ', arg);
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(arg.walletAddress);
        if (!identity) return false

        const connection = await connectionOrg(arg.walletAddress, arg.orgName);
        console.log('connection: ', connection)
        const gateway = new Gateway();
        await gateway.connect(connection.ccp, connection.connectOptions);

        const caInfo = connection.ccp.certificateAuthorities[mapOrganizations.get(arg.orgName)];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        let adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            await enrollAdmin();
            adminIdentity = await wallet.get('admin');
            console.log("Admin Enrolled Successfully")
        }
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        const identityService = await ca.newIdentityService();

        const retrieveIdentity = await identityService.getOne(arg.walletAddress, adminUser)
        let userWallet = retrieveIdentity.result.id

        console.log('attrs: ', retrieveIdentity.result);
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
        console.log(`Getting error: ${error}`)
        return false
    }
}

const importUserByWallet = async (arg)  => {
    try {
        console.log('arg : ', arg)
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(arg.walletAddress);
        if (!identity) {
            console.log('>> wallet was created: ');
            await wallet.put(arg.walletAddress, arg.x509Identity);
        }

        const connection = await connectionOrg(arg.walletAddress, arg.orgName);
        console.log('connection: ', connection);
        const gateway = new Gateway();
        await gateway.connect(connection.ccp, connection.connectOptions);

        const caInfo = connection.ccp.certificateAuthorities[mapOrganizations.get(arg.orgName)];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        let adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            await enrollAdmin();
            adminIdentity = await wallet.get('admin');
            console.log("Admin Enrolled Successfully")
        }
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        const identityService = await ca.newIdentityService();

        const retrieveIdentity = await identityService.getOne(arg.walletAddress, adminUser)
        let userWallet = retrieveIdentity.result.id

        console.log('attrs: ', retrieveIdentity.result);
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
        console.log(`Getting error: ${error}`)
        return false
    }
}

const getRegisteredUser = async (arg) => {
    console.log('getRegisteredUser walletAddress: ', arg.walletAddress);
    const ccpPath = path.resolve(__dirname, '../../', 'config', 'connection-org1.json');
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
    const ccp = JSON.parse(ccpJSON);
    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities[mapOrganizations.get(arg.orgName)].url;
    const ca = new FabricCAServices(caURL);
    console.log('caURL: ',caURL)
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the admin user.
    let adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin();
        adminIdentity = await wallet.get('admin');
        console.log("Admin Enrolled Successfully");
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    let keyStore = crypto.AesEncrypt(JSON.stringify(arg.keyStore), arg.password);
    if(!keyStore) return;
    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: arg.walletAddress, role: 'client', attrs: [{ name: arg.walletType, value: keyStore, ecert: true }] }, adminUser);

    const enrollment = await ca.enroll({ enrollmentID: arg.walletAddress, enrollmentSecret: secret, attr_reqs: [{ name: arg.walletType, optional: true }] });

    console.log('enrollment: ', enrollment)

    const x509Identity = {
        walletAddress: arg.walletAddress,
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
        linked: arg.keyStore
    };

    await wallet.put(arg.walletAddress, x509Identity);
    console.log(`Successfully registered and enrolled admin user ${arg.walletAddress} and imported it into the wallet`);

    return x509Identity
}


const enrollAdmin = async () => {
    try {
        const ccpPath = path.resolve(__dirname, '../../', 'config', 'connection-org1.json');
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
        const ccp = JSON.parse(ccpJSON);

        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
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
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
    }


}

exports.getRegisteredUser = getRegisteredUser
exports.importUserByWallet = importUserByWallet
exports.getUserIdentity = getUserIdentity
