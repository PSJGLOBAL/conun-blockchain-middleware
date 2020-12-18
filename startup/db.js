const mongoose = require('mongoose');
const config = require('config');

module.exports = function () {
    mongoose.connect(config.get('db'), { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Mongo DB is Connected!');
        });
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);

}

//
// module.exports = function () {
//     mongoose.connect('mongodb://192.168.100.105/conun-middleware-db', { useNewUrlParser: true, useUnifiedTopology: true })
//         .then(() => {
//             console.log('MongoDB is connected...');
//         })
//         .catch((err) => {
//             console.error('Error while MongoDB connection...', err);
//         });
//     mongoose.set('useFindAndModify', false);
//     mongoose.set('useCreateIndex', true);
//
// //     // Retry connection
// //     const connectWithRetry = () => {
// //         console.log('MongoDB connection with retry')
// //         return mongoose.connect(config.get('db'), { useNewUrlParser: true, useUnifiedTopology: true })
// //     }
// //
// // // Exit application on error
// //     mongoose.connection.on('error', err => {
// //         console.log(`MongoDB connection error: ${err}`)
// //         setTimeout(connectWithRetry, 5000)
// //         // process.exit(-1)
// //     })
// //
// //     mongoose.connection.on('connected', () => {
// //         console.log('MongoDB is connected')
// //     })
// //
// //     if (config.env === 'development') {
// //         mongoose.set('debug', true)
// //     }
// //
// //     const connect = () => {
// //         connectWithRetry()
// //     }
// }