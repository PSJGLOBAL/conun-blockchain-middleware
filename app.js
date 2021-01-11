'use strict';
const express = require('express');
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require ('./swagger.json');
const cors = require('cors');
const bodyParser = require('body-parser');
const constants = require('./config/constants.json');

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

require('./startup/logging');
require('./startup/routes.v1')(app);
require('./test/jMeter/routes.v1')(app);
require('./startup/db')();
require('./startup/config')();

// if (process.env.NODE_ENV !== 'production') {
//     this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// }
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// app.get('/swagger.json', function(req, res) {
//     res.setHeader('Content-Type', 'application/json');
//     res.send(swaggerDocument);
// });


const port = process.env.PORT || constants.port;
const server = app.listen(port, () => {
    console.log(`set ${port} port listening...`);
});
server.timeout = 240000

app.get('/', async (req, res)  => {
    res.send({"msg": "server is working"})
});

module.exports = server;