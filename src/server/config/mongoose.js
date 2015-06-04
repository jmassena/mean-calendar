'use strict';

var config = require('./environment');
var mongoUriUtil = require('mongodb-uri');
var mongoose = require('mongoose');

module.exports.connect = function () {

  var dbOptions = {
    server: {
      socketOptions: {
        keepAlive: 1,
        connectTimeoutMS: 30000
      }
    }
    // ,
    // replset: {
    //   socketOptions: {
    //     keepAlive: 1,
    //     connectTimeoutMS: 30000
    //   }
    // }
  };

  mongoose.connect(config.mongoose.connectionString, dbOptions);

  mongoose.connection.on('error',
    function () {
      console.log('MongoDB connection error');
    });

  mongoose.connection.once('open',
    function () {
      console.log('Connected to MongoDB');
    });

};
