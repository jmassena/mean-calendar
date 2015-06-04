'use strict';

var exceptionMessages = require('../common/exceptionMessages.js');
var mongoose = require('mongoose');
var crypto = require('crypto');
// var uniqueValidator = require('mongoose-unique-validator');
// var _ = require('underscore');

var providers = ['google'];

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
      default: 'local'
    },

    google: {},

    createdDateTime: {
      type: Date,
      default: Date.now
    }
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
