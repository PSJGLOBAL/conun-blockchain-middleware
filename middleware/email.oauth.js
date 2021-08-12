const https = require('https');

async function oauth (req, res, next) {
    let options = null;  
    if(req.body.oauthType === 'google') {
        options = {
            hostname: 'www.googleapis.com',
            port: 443,
            path: `/oauth2/v1/userinfo?alt=json&access_token=${req.body.token}`,
            method: 'GET',
        }
    }
    
    else if(req.body.oauthType === 'kakao') {
        options = {
            hostname: 'kapi.kakao.com',
            port: 443,
            path: '/v2/user/me',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${req.body.token}`
            }
        }
    }
    try {
        https.get(options, (_res) => {
            _res.setEncoding('utf8');
            _res.on('data', function (chunk) {
                let responce = JSON.parse(chunk)
                console.log('statusCode: ', _res.statusCode)
                console.log('responce: ', responce)
                if(req.body.oauthType === 'google' && _res.statusCode === 200) {
                    req.body.email = responce.email;
                    req.body.name = responce.name;
                    console.log(req.body.email, req.body.name )
                    next();
                } else if(req.body.oauthType === 'kakao' && _res.statusCode === 200) {
                    req.body.email = responce.kakao_account.email;
                    req.body.name = responce.kakao_account.profile.nickname;
                    console.log(req.body.email, req.body.name )
                    next();
                }
                else return res.status(401).json({payload: responce, success: false,  status: _res.statusCode });

            });
            req.on('error', error => {
                console.error(error)
                return res.status(401).json({payload: error, success: false,  status: _res.statusCode });
            });
        });

    } catch (error) {
        console.log('oauth error: ', error);
        return res.status(401).json({payload: error, success: false,  status: 401 });
    }
}

module.exports = oauth;