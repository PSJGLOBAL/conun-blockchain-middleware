module.exports = function verify(req, res, next) {
    try {
        if (!req.params.chainCodeName) {
            return res.status(400).send({
                'message': 'chainCodeName:',
                'status': false
            });
        }
        if (!req.params.channelName) {
            return res.status(400).send({
                'message': 'channelName',
                'status': false
            });
        }
        next();
    } catch (e) {
        return res.status(400).send({
            'message': 'not valid request',
            'status': false
        });
    }
}