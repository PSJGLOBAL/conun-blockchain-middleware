const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config();
const bodyParser = require('body-parser');
const Helper = require('../common/helper');
const logger = Helper.getLogger('app');
const EtherEvent = require('./event/ether.event')
const bridgeAbiJson = require('../app/web3/bridge.swap.abi.json');

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
require('./jMeter/jm.worker.routes')(app);
require('./startup/db')();

let BridgeContractAddress = process.env.ETHER_BRIDGE_CONTRACT_ADDRESS;
let url = process.env.ETHER_WS_PROVIDER;

const etherEvent = new EtherEvent(BridgeContractAddress, bridgeAbiJson, url);
etherEvent.listenEvent();

app.get('/', async (req, res)  => {
    res.status(200).json({
        message: `worker Id: ${etherEvent.eventId}`,
        success: true,
        status: 200
    })
});

console.log('process.env.NODE_ENV:  ', process.env.NODE_ENV, process.env.WORKER_PORT);

const server = app.listen(process.env.WORKER_PORT, () => {
    console.log(`Woker listening to ${process.env.WORKER_PORT}`);
    logger.info(`worker listening to ${process.env.WORKER_PORT}`);
});

process.on('uncaughtException', ex => {
    console.log('>> worker uncaughtException: ', ex);
    logger.error('>> worker uncaughtException:', ex);
});


server.timeout = 240000;
module.exports = server;