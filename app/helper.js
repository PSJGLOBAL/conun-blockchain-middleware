'use strict';

var { Gateway, Wallets, DefaultEventHandlerStrategies  } = require('fabric-network');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const crypto = require('../utils/crypto/encryption.algorithm');
const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org1.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const mapOrganizations = new Map();
mapOrganizations.set('Org1', 'ca.org1.example.com')
mapOrganizations.set('Org2', 'ca.org2.example.com')

async function connectionOrg(wallet_address, org_name) {
    try {
        console.log('connectionOrg: ', wallet_address, org_name);
        const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org1.json');
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
        const ccp = JSON.parse(ccpJSON);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`connectionOrg Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(wallet_address);
        if (!identity) return;

        const connectOptions = {
            wallet, identity: wallet_address, discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
            },
        }
        return  {
            ccp,
            connectOptions
        };
    } catch (e) {
        console.log('connectionOrg Error: ', e);
    }
}

const getUserIdentity = async (arg)  => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        let identity = await wallet.get(arg.wallet_address);
        if (!identity) {
            return false
        }

        const connection = await connectionOrg(arg.wallet_address, 'Org1');
        const gateway = new Gateway();

        await gateway.connect(connection.ccp, connection.connectOptions);


        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
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

        const retrieveIdentity = await identityService.getOne(arg.wallet_address, adminUser)
        let userWallet = retrieveIdentity.result.id

        return new Promise((resolve, reject) => {
            retrieveIdentity.result.attrs.forEach(obj => {
                if(obj.name === arg.walletType) {
                    let privateKey = crypto.AESDecrypt(obj.value, arg.password)
                    console.log('privateKey: ', privateKey)
                    if(privateKey)
                        resolve({
                            walletType: obj.name,
                            wallet: userWallet,
                            privateKey: privateKey
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
    console.log('getRegisteredUser wallet_address: ', arg.wallet_address);
    console.log('mapOrganizations: ', mapOrganizations.get(arg.orgName))
    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities[mapOrganizations.get(arg.orgName)].url;
    const ca = new FabricCAServices(caURL);
    console.log('caURL: ',caURL)
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(arg.wallet_address);
    if (userIdentity) {
        console.log(`An identity for the user ${arg.wallet_address} already exists in the wallet`);
        return {
            success: true,
            message: arg.wallet_address + ' enrolled Successfully',
        }
    }

    // Check to see if we've already enrolled the admin user.
    let adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin();
        adminIdentity = await wallet.get('admin');
        console.log("Admin Enrolled Successfully")
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    let privateKey = crypto.AesEncrypt(arg.privateKey, arg.password);
    if(!privateKey) return;
    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: arg.wallet_address, role: 'client', attrs: [{ name: arg.walletType, value: privateKey, ecert: true }] }, adminUser);

    const enrollment = await ca.enroll({ enrollmentID: arg.wallet_address, enrollmentSecret: secret, attr_reqs: [{ name: arg.walletType, optional: true }] });


    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };

    await wallet.put(arg.wallet_address, x509Identity);
    console.log(`Successfully registered and enrolled admin user ${arg.wallet_address} and imported it into the wallet`);

    return {
        success: true,
        message: arg.wallet_address + ' enrolled Successfully',
    }
}


const enrollAdmin = async () => {
    try {
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
        return;


    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
    }


}

exports.getRegisteredUser = getRegisteredUser
exports.getUserIdentity = getUserIdentity
exports.connectionOrg = connectionOrg