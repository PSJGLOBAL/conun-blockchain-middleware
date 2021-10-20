const express = require('express');
const bridgeSwapRoute = require('./jm.swap');

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/v1/jm/bridge-swap', bridgeSwapRoute);
}