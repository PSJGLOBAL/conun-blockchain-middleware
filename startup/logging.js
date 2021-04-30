require('express-async-errors');
require('winston-mongodb');
const winston = require('winston');
const config = require('config');
var options = {
    file: {
        level: 'silly',
        filename: `${__dirname}/logs/app.log`,
        handleExceptions: true,
        json: false,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'silly',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
    LogDB: {
        db: config.get('log.logDB'),
        level: 'silly',
        handleExceptions: true,
    }
};

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console,
        new winston.transports.MongoDB(options.LogDB),
    ],
    exitOnError: false
});

logger.info("Logger is working")
logger.error("Testing errors too!")

process.on('uncaughtException', ex => {
    logger.error('>> uncaughtException: ', ex);
})

module.exports = {logger}
