const express = require('express');
const usersRoute = require('./jMroutes/profile/user');
const tokenRoute = require('./jMroutes/chaincode/token');
const driveRoute = require('./jMroutes/chaincode/drive');

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/v1/jm/users', usersRoute);
    app.use('/api/v1/jm/con-token', tokenRoute);
    app.use('/api/v1/jm/drive', driveRoute);
}