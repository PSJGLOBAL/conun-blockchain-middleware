const express = require('express');
const usersRoute = require('../routes/profile/user');
const usersAuth = require('../routes/profile/auth');
const usersAdmin = require('../routes/profile/admin');
const chainCodeInvoke = require('../routes/chaincode/invoke');

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/v1/users', usersRoute);
    app.use('/api/v1/auth', usersAuth);
    app.use('/api/v1/admin', usersAdmin);
    app.use('/api/v1/invoke', chainCodeInvoke);
}