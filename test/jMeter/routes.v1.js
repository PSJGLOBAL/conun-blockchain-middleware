const express = require('express');
const cvUsersRoute = require('../jMeter-csv-utility/user');
const conxTransfer = require('../jMeter-csv-utility/conxTransfer');
const swapCSV = require('../jMeter-csv-utility/csv.swap');

const usersRoute = require('./jmRoutes/profile/user');
const tokenRoute = require('./jmRoutes/chaincode/token');
const driveRoute = require('./jmRoutes/chaincode/drive');
const bridgeSwap = require('./jmRoutes/chaincode/swap');

module.exports = function (app) {
    app.use(express.json());
    // gen csv file
    app.use('/api/v1/jm/cv', cvUsersRoute);
    app.use('/api/v1/jm/conx', conxTransfer);
    app.use('/api/v1/jm/bridge-swap-csv', swapCSV);
    // jMeter api
    app.use('/api/v1/jm/users', usersRoute);
    app.use('/api/v1/jm/con-token', tokenRoute);
    app.use('/api/v1/jm/bridge-swap', bridgeSwap);
    app.use('/api/v1/jm/drive', driveRoute);
}