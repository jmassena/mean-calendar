'use strict';

var config = require('../config/environment');

module.exports.notFoundHandler = function (req, res, next) {

  // catch 404 and forward to error handler
  var err = new Error('Resource Not Found');
  err.status = 404;
  next(err);
};

module.exports.errorHandler = function (err, req, res, next) {

  if(config.env === 'dev') {
    console.log('error handler route called');
    console.log(err);

  }

  var code = err.statusCode || 500;
  var name = err.name || 'Unspecified Error';
  var msg;

  if(err.exceptionInfo) {
    msg = err.exceptionInfo.message;
  } else {
    // unhandled error. We won't pass the message but we should log it.
    msg = 'Error occurred';
    // TODO: implement logging system for saving to file and add errors from here
    console.error(err);
  }

  return res
    .status(code)
    .json({
      name: name,
      message: msg
    });
};
