const mongoose = require('mongoose');
const Helper = require('../common/helper');

const logger = Helper.getLogger('MongoDB')

let options = {
    dbName: process.env.MONGODB_NAME,
    auth: { "authSource": "admin" },
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }

module.exports = function () {
    mongoose.connect(`mongodb://${process.env.MONGODB_URL}`, options)
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    // Retry connection
    const connectWithRetry = () => {
        logger.info(`MongoDB connection with retry`)
        return mongoose.connect(`mongodb://${process.env.MONGODB_URL}`, options)
    }

// Exit application on error
    mongoose.connection.on('error', err => {
        logger.info(mongoose.connection.readyState);
        logger.error(`MongoDB connection error: ${err}`);
        mongoose.connection.close();
        setTimeout(connectWithRetry, 50000)
    })

    mongoose.connection.on('connected', () => {
        logger.info(mongoose.connection.readyState);
        logger.info('Mongo DB is Connected!');
    })

    if (process.env.NODE_ENV === 'development') {
        mongoose.set('debug', true);
    }
}

// 0 = disconnected
// 1 = connected
// 2 = connecting
// 3 = disconnecting

// delete mongoose.models['User'];
// delete mongoose.connection.collections['users'];
// delete mongoose.modelSchemas['User'];
