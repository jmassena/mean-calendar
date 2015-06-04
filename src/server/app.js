'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var config = require('./config/environment');

// configure dev logger
if(config.logLevel === 'none') {
  require('./common/myLog.js').config({
    logFlag: false,
    logTypesAllowed: []
  });
} else {
  require('./common/myLog.js').config({
    logFlag: true,
    logTypesAllowed: ['Success', 'Error', 'Info']
  });
}

require('./config/mongoose').connect();

var app = express();

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

app.use(passport.initialize());

require('./auth/google/passport').setup();
require('./auth/local/passport').setup();

// static dir
if(config.env === 'build' || config.env === 'pro') {
  app.use('/', express.static('./dist'));
} else {
  app.use('/', express.static('./src/client')); // angular
  app.use('/', express.static('./')); // bower_components
}

// routes setup
require('./routes/index.js')(app, passport);

console.log('About to start node');
console.log('NODE_ENV: ' + config.env);
console.log('PORT: ' + config.port);
console.log('DB: ' + config.mongoose.dbName);
console.log('NODE_LOG_LEVEL: ' + config.logLevel);

module.exports = app;
