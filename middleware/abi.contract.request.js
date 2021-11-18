const https = require('https');
const Helper = require("../common/helper");
const logger = Helper.getLogger("middleware/abi.contract.request");

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
                });
                _res.on('end', function() {
                    if(_res.statusCode === 200)
                        resolve(JSON.parse(rawData))
                    else reject({payload: chunk, success: false,  status: _res.statusCode})
                });
            });
        });
    } catch (error) {
        logger.error('oauth error: ', error);
        return {payload: error, success: false,  status: 400 }
    }
}