const express = require('express');
const cvUsersRoute = require('../jMeter-csv-utility/user');
const conxTransfer = require('../jMeter-csv-utility/conxTransfer');

const usersRoute = require('./jmRoutes/profile/user');
const tokenRoute = require('./jmRoutes/chaincode/token');
const driveRoute = require('./jmRoutes/chaincode/drive');

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/v1/jm/cv', cvUsersRoute);
    app.use('/api/v1/jm/conx', conxTransfer);

    app.use('/api/v1/jm/users', usersRoute);
    app.use('/api/v1/jm/con-token', tokenRoute);
    app.use('/api/v1/jm/drive', driveRoute);
}