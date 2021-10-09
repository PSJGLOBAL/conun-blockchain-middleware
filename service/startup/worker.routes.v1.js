const express = require('express');
const bridgeSwapRoute = require('../routes/swap');

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/v1/bridge-swap', bridgeSwapRoute);
}