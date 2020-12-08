module.exports  = function (req, res, next) {
    if(!req.user.isAdmin)
        return res.status(403).send('request ignored, not admin level user');
    next();
}