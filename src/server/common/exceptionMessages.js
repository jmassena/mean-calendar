'use strict';

var utils = require('./utils.js');
var exceptionInfo = {};

exceptionInfo.exceptionTypes = {
  system: 'system', // connection issues, unanticipated error
  database: 'database', // fkey, unique constraint
  user: 'user' //invalid date range
};

exceptionInfo.items = {};

var type;
var code;

// system exceptions: 1000 - 2000
type = exceptionInfo.exceptionTypes.system;
addInfo(1000, type, 'system_error', 'Error occurred', 'Unanticipated exception occurred');
addInfo(1001, type, 'exception_type_not_found', 'Error occurred', 'Invalid exception type code');
addInfo(1002, type, 'path_id_differs_from_object_id', 'Error occurred', 'Id in path is different from id in object');

// database exceptions: 2000 - 3000
type = exceptionInfo.exceptionTypes.database;
addInfo(2000, type, 'database_error', 'Error occurred', 'Unanticipated exception occurred');
addInfo(2001, type, 'cannot_update_object_with_null_id', 'Error occurred', 'Cannot update object with blank id field');
addInfo(2002, type, 'unhandled_validation_failure', 'Object validation failed');

// user exceptions: 3000 - 4000
type = exceptionInfo.exceptionTypes.user;
addInfo(3000, type, 'username_or_password_not_found', 'Username and password combination not found');
addInfo(3001, type, 'username_not_available', 'Username is associated with an existing account');
addInfo(3002, type, 'email_not_available', 'Email is associated with an existing account');
addInfo(3002, type, 'email_and_username_not_available', 'Email and user-name are associated with an existing account');
addInfo(3003, type, 'user_not_found_for_id', 'User not found', 'Invalid user id');
addInfo(3004, type, 'object_not_found_by_id', 'Object not found', 'Invalid item id');
addInfo(3005, type, 'validation_failure', 'Validation failed');

exceptionInfo.createError = function (code, userInfo, debugInfo) {
  var item = getInfo(code);

  if(userInfo) {
    item.message += '. ' + userInfo;
  }

  // add userInfo if no debugInfo passed
  var tmpDebugInfo = debugInfo || userInfo;
  if(tmpDebugInfo) {
    if(item.debugMessage) {
      item.debugMessage += '. ' + tmpDebugInfo;
    } else {
      item.debugMessage = tmpDebugInfo;
    }
  }

  var e = new Error(item.message);
  e.exceptionInfo = item;
  return e;
};

function getInfo(code) {

  if(!exceptionInfo.items[code]) {
    var e = new Error('Invalid exception code: ' + code);
    try {
      // don't let this throw, even though it never should
      e.exceptionInfo = utils.cloneDeep(exceptionInfo.items['exception_type_code_not_found']);
    } catch(err) {
      // TODO: create better logging system so we can save logs to file
      console.error('exception_type_code_not_found');
      console.log('exception_type_code_not_found');
    }
    throw e;
  } else {
    return utils.cloneDeep(exceptionInfo.items[code]);
  }
}

function addInfo(id, type, code, message, debugMessage) {

  if(exceptionInfo.items[code]) {
    throw new Error('code already used for exception info. Code: ' + code);
  }

  exceptionInfo.items[code] = {
    id: id,
    type: type,
    code: code,
    message: message,
    debugMessage: debugMessage,
  };
}

module.exports = exceptionInfo;
