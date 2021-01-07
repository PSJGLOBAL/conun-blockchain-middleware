'use strict';
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const constants = require('./config/constants.json');
const expressOasGenerator = require('express-oas-generator');

app.use((req, res,next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

const corsOptions = {
    origin: ["*"],
    credentials: true,
    methods: "POST, PUT, OPTIONS, DELETE, GET",
    allowedHeaders: "X-Requested-With, Content-Type, x-auth-token"
}
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

expressOasGenerator.init(
    app,
    function(spec) { return spec; },
    'api-docs',
    true
)
expressOasGenerator.handleRequests();

require('./startup/logging');
require('./startup/routes.v1')(app);
require('./test/jMeter/routes.v1')(app);
require('./startup/db')();
require('./startup/config')();


const port = process.env.PORT || constants.port;
const server = app.listen(port, () => {
    console.log(`set ${port} port listening...`);
});
server.timeout = 240000

app.get('/', async (req, res)  => {
    res.send({"msg": "server is working"})
});

module.exports = server;