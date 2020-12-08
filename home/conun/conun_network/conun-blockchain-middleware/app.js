'use strict';
const bodyParser = require('body-parser');
const http = require('http');
const express = require('express');
const app = express();
const cors = require('cors');
const constants = require('./config/constants.json');

const port = process.env.PORT || constants.port;

require('./startup/logging');
require('./startup/routes.v1')(app);
require('./startup/db')();
require('./startup/config')();

console.log('start');
app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

var server = http.createServer(app).listen(port, function () { console.log(`Server started on ${port}`) });
server.timeout = 240000;


app.get('/', async (req, res)  => {
    res.send({"msg": "server is working"})
});
