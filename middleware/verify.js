module.exports = function verify(req, res, next) {
    try {
        console.log('req.params: ', req.params);
        if (!req.params.chainCodeName) {
            return res.status(400).json({
                'message': 'chainCodeName:',
                'status': false
            });
        }
        if (!req.params.channelName) {
            return res.status(400).json({
                'message': 'channelName',
                'status': false
            });
        }
        next();
    } catch (e) {
        return res.status(400).json({
            'message': 'not valid request',
            'status': false
        });
    }
}