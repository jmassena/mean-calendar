'use strict';

var config = require('../config/environment');
var exceptionMessages = require('../common/exceptionMessages');

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

  var isDevOrTest = ['dev', 'test'].indexOf(config.env) !== -1;
  var code = err.statusCode || 500;
  var name = err.name || 'Unspecified Error';
  var msg;
  var stack;

  console.log(code);

  if(err.name === 'ValidationError' && !err.statusCode) {
    code = 422;
  }

  if(err.exceptionInfo &&
    (err.exceptionInfo.type === exceptionMessages.exceptionTypes.user || isDevOrTest)) {
    // only show user type exception messages to user unless we are in dev/test
    msg = err.exceptionInfo.message;

  } else {
    // Log exception but don't pass real message to web.
    msg = 'Error occurred';
    console.error(err);
  }

  if(isDevOrTest) {
    console.log(err);
    if(err.stack) {
      stack = err.stack;
      console.log(err.stack);
    }
  }

  return res
    .status(code)
    .json({
      name: name,
      message: msg,
      stack: stack
    });
};
