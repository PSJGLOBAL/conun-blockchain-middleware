const https = require('https');
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

//          const etherAbi = require('../../middleware/abi.contract.request');
//          let conABI = await etherAbi(conContractAddrress);
//          let bridgeABI = await etherAbi(bridgeContractAddrress);

module.exports = etherAbi;
