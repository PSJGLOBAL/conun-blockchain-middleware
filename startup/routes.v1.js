const express = require('express');
const usersRoute = require('../routes/profile/user');


module.exports = function (app) {
    app.use(express.json());
    app.use('/api/users', usersRoute);
}