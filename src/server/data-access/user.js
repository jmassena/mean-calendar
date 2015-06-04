'use strict';

var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var _ = require('underscore');

var UserModel = require('../db-models/user.js');
var log = require('../common/myLog.js').create('/server/db-access/user');
var exceptionMessages = require('../common/exceptionMessages.js');

var userFields = 'userId userName email firstName lastName fullName';

function get(condition) {
  return UserModel
    .find(condition)
    .select(userFields).exec();
}

function getById(userId) {
  return log.promise('getById',
    UserModel.findById(userId)
    .select(userFields)
    .exec());
}

function create(user) {

  var copy = _.clone(user);
  delete copy._id;

  var newUser = new UserModel(copy);

  return saveUser(newUser);
}

function deleteById(userId) {

  return log.promise('deleteById',
    UserModel.findOneAndRemove({
      _id: userId
    }).exec()
    .then(function (data) {
      if(!data) {
        var error = exceptionMessages.createError('user_not_found_for_id', null, 'id: ' + userId);
        error.statusCode = 404;
        throw error;
      }
      return data;
    }));
}

function saveUser(user) {
  return log.promise('saveUser',
    user.save()
  ).then(function (data) {
      return data;
    },

    function (err) {

      if(!err.exceptionInfo && err.message === 'User validation failed') {
        var customError;

        var errMsg = Object.keys(err.errors).map(function (key) {
          return err.errors[key].message.replace(/Path /g, '').replace(/`/g, '');
        }).join('. ');
        customError = exceptionMessages.createError('validation_failure', errMsg);
        customError.statusCode = 422; //422 Unprocessable Entity
        throw customError;
      } else {
        // not a validation error!
        throw err;
      }
    }
  );
}

function update(user) {

  if(!user._id) {
    var promise = new mongoose.Promise();
    var error = exceptionMessages.createError('cannot_update_object_with_null_id', 'User update');
    error.statusCode = 422; //422 Unprocessable Entity
    promise.reject(error);
    return promise;
  }

  return log.promise('update',
    getById(user._id)
    .then(function (dbUser) {
      if(!dbUser) {
        var error = exceptionMessages.createError('user_not_found_for_id', null, 'id: ' + user._id);
        error.statusCode = 404;
        throw error;
      }
      // only these fields should be updated
      ['userName', 'email', 'firstName', 'lastName'].forEach(function (val) {
        dbUser[val] = user[val];
      });
      return saveUser(dbUser);
    })
  );
}

module.exports = {
  Model: UserModel,
  get: get,
  getById: getById,
  create: create,
  deleteById: deleteById,
  update: update
};
