module.exports  = function (req, res, next) {
    if(!req.user.isAdmin)
        return res.status(403).json({payload: 'request ignored, not admin level user', success: false,  status:  403 })
    next();
}
