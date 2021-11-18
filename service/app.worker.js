const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const bodyParser = require('body-parser');
const logger = require('../common/helper').getLogger('worker');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

const corsOptions = {
    origin: ["*"],
    credentials: true,
    methods: "POST, PUT, OPTIONS, DELETE, GET",
    allowedHeaders: "X-Requested-With, Content-Type, jwtAuthToken"
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

require('./startup/worker.routes.v1')(app);
require('./startup/db')();

const server = app.listen(process.env.WORKER_PORT, () => {
    logger.info(`worker listening ...`);
});

process.on('uncaughtException', ex => {
    logger.error('>> worker uncaughtException:', ex);
});


server.timeout = 240000;
module.exports = server;