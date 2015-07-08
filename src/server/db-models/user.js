'use strict';

var exceptionMessages = require('../common/exceptionMessages.js');
var mongoose = require('mongoose');
var crypto = require('crypto');
var _ = require('underscore');

var userFields = 'userId userName email firstName lastName fullName';

var providers = ['google', 'local'];

if(!mongoose.models.User) {

  var UserSchema = new mongoose.Schema({
    userName: {
      type: String,
      trim: true,
      minlength: 8,
      maxlength: 100
    },

    hashedPassword: String,

    salt: String,

    email: {
      type: String,
      lowercase: true,
      trim: true
        // match: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true
    },

    provider: {
      type: String,
      required: true,
      default: 'local',
      enum: providers
    },

    google: {},

    // NOTE: we can get the time an object was created from the objectId like so
    // ObjectId('1234123412341324').getTimestamp(); returns ISODate("2012-10-15T21:26:17Z").
    // createdDateTime: {
    //   type: Date,
    //   default: Date.now
    // }
  });

  UserSchema.set('toJSON', {
    getters: true,
    virtuals: true
  });
  UserSchema.set('toObject', {
    getters: true,
    virtuals: true
  });

  UserSchema
    .virtual('password')
    .set(function (password) {
      this.salt = this.makeSalt();
      this.hashedPassword = this.encryptPassword(password);
    });

  // virtuals
  UserSchema
    .virtual('fullName')
    .get(function () {
      return this.firstName + ' ' + this.lastName;
    });

  // validation
  // userName length
  UserSchema
    .path('userName')
    .validate(function (value) {
        if(value && value.length < 8) {
          return false;
        }
        return true;
      },
      'Username must be at least 8 characters');

  validateUnique('email');
  validateUnique('userName');

  UserSchema
    .pre('save', function (next) {

      if(this.provider === 'local') {
        // user must have username/password/email local provider

        var error;
        if(!this.userName) {
          error = exceptionMessages.createError('validation_failure', 'UserName is required');
        }
        if(!this.hashedPassword) {
          error = exceptionMessages.createError('validation_failure', 'Password is required');
        }
        if(!this.email) {
          error = exceptionMessages.createError('validation_failure', 'Email is required');
        }

        if(error) {
          error.statusCode = 422; //unporcessable entity
          return next(error);
        }
      }

      next();

    });

  UserSchema.methods = {

    authenticate: function (plainText) {

      return this.encryptPassword(plainText) === this.hashedPassword;
    },

    makeSalt: function () {
      return crypto.randomBytes(16).toString('base64');
    },

    encryptPassword: function (password) {
      if(!password || !this.salt) {
        return '';
      }
      var salt = new Buffer(this.salt, 'base64');
      return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
  };

  UserSchema.statics = {
    get: function (condition) {
      return this.find(condition)
        .select(userFields).exec();
    },
    getById: function (userId) {

      return this.findById(userId)
        .select(userFields)
        .exec();
    },

    saveUser: function (user) {

      return user.save()
        .then(function (data) {
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
    },
    updateUser: function (user) {

      if(!user._id) {
        var promise = new mongoose.Promise();
        var error = exceptionMessages.createError('cannot_update_object_with_null_id',
          'User update');
        error.statusCode = 422; //422 Unprocessable Entity
        promise.reject(error);
        return promise;
      }

      return this.getById(user._id)
        .then(function (dbUser) {
          if(!dbUser) {
            var error = exceptionMessages.createError('user_not_found_for_id', null, 'id: ' +
              user._id);
            error.statusCode = 404;
            throw error;
          }
          // only these fields should be updated
          ['userName', 'email', 'firstName', 'lastName'].forEach(function (val) {
            dbUser[val] = user[val];
          });
          return this.saveUser(dbUser);
        });

    }
  };

  mongoose.model('User', UserSchema);
}

// helper
function validateUnique(path, pathDesc) {
  UserSchema
    .path(path)
    .validate(function (value, respond) {
      if(value) {

        var whereClause = {};
        whereClause[path] = value;

        var self = this;
        this.constructor.findOne(whereClause, function (err, data) {
          if(err) {
            throw err;
          }

          if(data && data.id !== self.id) {
            respond(false);
          }
          respond(true);
        });
      }
    }, 'The ' + (pathDesc || path) + ' is already in use');
}

module.exports = mongoose.model('User');
