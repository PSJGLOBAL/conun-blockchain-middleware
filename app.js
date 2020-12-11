'use strict';
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const constants = require('./config/constants.json');

require('./startup/logging');
require('./startup/routes.v1')(app);
require('./test/jMeter/routes.v1')(app);
require('./startup/db')();
require('./startup/config')();

console.log('start');
app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const port = process.env.PORT || constants.port;
const server = app.listen(port, () => {
    console.log(`set${port} port listening...`);
});
server.timeout = 240000

app.get('/', async (req, res)  => {
    res.send({"msg": "server is working"})
});

module.exports = server;