const express = require('express');
const usersRoute = require('./user');
const chainCodeInvoke = require('./invoke');

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/v1/jm/users', usersRoute);
    app.use('/api/v1/jm/con-token', chainCodeInvoke);
}