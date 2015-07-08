'use strict';

var mongoose = require('mongoose');
var idvalidator = require('mongoose-id-validator');
var exceptionMessages = require('../common/exceptionMessages.js');

var ObjectId = mongoose.Schema.Types.ObjectId;

if(!mongoose.models.Session) {

  var SessionSchema = new mongoose.Schema({

    userId: {
      type: ObjectId,
      ref: 'User',
      required: '{PATH} is required'
    },
    createdDateTime: {
      type: Date,
      required: '{PATH} is required',
      default: Date.now
    },
    expireDateTime: {
      type: Date,
      required: '{PATH} is required'
    }

  });

  // valdidate that user with specified id really exists
  SessionSchema.plugin(idvalidator, {
    message: 'Error, Invalid {PATH} {VALUE}.'
  });

  SessionSchema.statics = {
    updateSession: function (session) {
      if(!session._id) {
        var promise = new mongoose.Promise();
        var error = exceptionMessages.createError('cannot_update_object_with_null_id',
          'Session update',
          'Session update');
        error.statusCode = 422; //422 Unprocessable Entity
        promise.reject(error);
        return promise;
      }

      return this.findById(session._id)
        .then(function (foundSession) {
          if(!foundSession) {
            var error = exceptionMessages.createError('object_not_found_by_id', 'Session',
              'Session Id: ' + session._id);
            error.statusCode = 404; // not found
            throw error;
          } else {
            foundSession.createdDateTime = session.createdDateTime;
            foundSession.expireDateTime = session.expireDateTime;
            return foundSession.save();
          }
        });
    },

    deleteOldSessions: function (maxDateTime) {

      return this.find({
          'expireDateTime': {
            $lt: maxDateTime
          }
        })
        .remove().exec();
    }
  };

  mongoose.model('Session', SessionSchema);
}

module.exports = mongoose.model('Session');
