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
addInfo(1000, type, 500, 'system_error', 'Error occurred', 'Unanticipated exception occurred');
addInfo(1001, type, 500, 'exception_type_not_found', 'Error occurred', 'Invalid exception type code');
addInfo(1002, type, 422, 'path_id_differs_from_object_id', 'Error occurred',
  'Id in path is different from id in object');

// database exceptions: 2000 - 3000
type = exceptionInfo.exceptionTypes.database;
addInfo(2000, type, 500, 'database_error', 'Error occurred', 'Unanticipated exception occurred');
addInfo(2001, type, 422, 'cannot_update_object_with_null_id', 'Error occurred',
  'Cannot update object with blank id field');
addInfo(2002, type, 422, 'unhandled_validation_failure', 'Object validation failed');

// user exceptions: 3000 - 4000
type = exceptionInfo.exceptionTypes.user;
addInfo(3000, type, 404, 'username_or_password_not_found', 'Username and password combination not found');
addInfo(3001, type, 409, 'username_not_available', 'Username is associated with an existing account');
addInfo(3002, type, 409, 'email_not_available', 'Email is associated with an existing account');
addInfo(3002, type, 409, 'email_and_username_not_available',
  'Email and user-name are associated with an existing account');
addInfo(3003, type, 404, 'user_not_found_for_id', 'User not found', 'Invalid user id');
addInfo(3004, type, 404, 'object_not_found_by_id', 'Object not found', 'Invalid item id');
addInfo(3005, type, 404, 'object_not_found', 'Object not found');
addInfo(3006, type, 422, 'validation_failure', 'Validation failed');
addInfo(3007, type, 403, 'permission_denied', 'Permission denied');
addInfo(3008, type, 403, 'admin_role_required', 'Permission denied. Admin role required to access the resource');

exceptionInfo.error = function (code, userInfo, debugInfo) {
  return exceptionInfo.createError(code, userInfo, debugInfo);
};

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
  e.status = item.statusCode;
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

function addInfo(id, type, statusCode, code, message, debugMessage) {

  if(exceptionInfo.items[code]) {
    throw new Error('code already used for exception info. Code: ' + code);
  }

  exceptionInfo.items[code] = {
    id: id,
    type: type,
    code: code,
    statusCode: statusCode,
    message: message,
    debugMessage: debugMessage,
  };
}

module.exports = exceptionInfo;
