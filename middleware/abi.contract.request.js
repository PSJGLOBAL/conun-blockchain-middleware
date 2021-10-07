const https = require('https');
const fs = require('fs');
//http://api-ropsten.etherscan.io/api?module=contract&action=getabi&address=${conContractAddrress}&format=raw
async function etherAbi (contractAddrress) {
    let options = {
            hostname: 'api-ropsten.etherscan.io',
            port: 443,
            path: `/api?module=contract&action=getabi&address=${contractAddrress}&format=raw`,
            method: 'GET',
            inflate: true,
            limit: '100kb',
        }
    let rawData = '';
    try {
        return new Promise (
            async (resolve, reject) => {
            https.get(options, (_res) => {
                console.log('>> >>')
                _res.setEncoding('utf8');
                _res.on('data', function (chunk) {
                    rawData += chunk;
                    console.log('rawData: ', rawData)
                    console.log('statusCode: ', _res.statusCode)
                });
                _res.on('end', function() {
                    if(_res.statusCode === 200)
                        resolve(JSON.parse(rawData))
                    else reject({payload: chunk, success: false,  status: _res.statusCode})
                });
            });
        });
    } catch (error) {
        console.log('oauth error: ', error);
        return {payload: error, success: false,  status: 400 }
    }
}

// let conContractAddrress = process.env.ETHER_CON_CONTRACT_ADDRESS
// let bridgeContractAddrress = process.env.ETHER_BRIDGE_CONTRACT_ADDRESS


// setTimeout(()=> {
//     etherAbi(conContractAddrress)
//         .then((conABI) => {
//             console.log('>> >>  ----- conContractAddrress >> ')
//             if (fs.existsSync('/home/conun/conun-middleware-testnet-v3/app/web3/conunABI.json')) {
//                 fs.unlinkSync('/home/conun/conun-middleware-testnet-v3/app/web3/conunABI.json');
//             }
//             fs.writeFile('/home/conun/conun-middleware-testnet-v3/app/web3/conunABI.json', JSON.stringify(conABI), 'utf8', function(err) {
//                 if (err) throw err;
//                 console.log('conABI: ', conABI);
//                 }
//             );
//         });
// }, 3000);



// setTimeout(()=> {
//     etherAbi(bridgeContractAddrress)
//         .then((bridgeABI) => {
//             console.log('>> >>  ----- bridgeContractAddrress >> ')
//             if (fs.existsSync('/home/conun/conun-middleware-testnet-v3/app/web3/bridgeABI.json')) {
//                 fs.unlinkSync('/home/conun/conun-middleware-testnet-v3/app/web3/bridgeABI.json');
//                 fs.writeFile('/home/conun/conun-middleware-testnet-v3/app/web3/bridgeABI.json', JSON.stringify(bridgeABI), 'utf8', function(err) {
//                     if (err) throw err;
//                     console.log('bridgeABI: ', bridgeABI);
//                     }
//                 );
//             }
//         });
// }, 9000);