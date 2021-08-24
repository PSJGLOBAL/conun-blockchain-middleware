const mongoose = require('mongoose');
const config = require('config');
const Helper = require('../common/helper');

const logger = Helper.getLogger('MongoDB')

let options = {
    dbName: config.get("db.name"),
    auth: { "authSource": "admin" },
    user: config.get("db.user"),
    pass: config.get("db.password"),
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }

module.exports = function () {
    mongoose.connect(config.get("db.url"), options)
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);

    // Retry connection
    const connectWithRetry = () => {
        console.log('MongoDB connection with retry')
        return mongoose.connect(config.get("db.url"), options)
    }

// Exit application on error
    mongoose.connection.on('error', err => {
        console.log(mongoose.connection.readyState);
        console.log(`MongoDB connection error: ${err}`);
        mongoose.connection.close();
        setTimeout(connectWithRetry, 5000)
    })

    mongoose.connection.on('connected', () => {
        console.log(mongoose.connection.readyState);
        console.log('Mongo DB is Connected!');
            logger.info('Mongo DB is Connected!');
    })

    if (config.env === 'development') {
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
