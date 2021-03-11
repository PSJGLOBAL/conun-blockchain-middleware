/**
 * check if wallet owner send request
 * verifying wallet
 * return: boolean
 */
function owner(req, res, next) {
    try {
        let walletAddress = req.query.walletAddress || req.body.walletAddress;
        console.log('walletAddress: ', walletAddress);
        if(walletAddress !== req.user.walletAddress)
            return res.status(400).json({message: 'requester is not owner', success: false,  status:  400 })
        next();
    } catch (e) {
        console.log('owner: ', e)
        return res.status(400).json({message: e.message, success: false,  status:  400 })
    }
}

module.exports = owner;
