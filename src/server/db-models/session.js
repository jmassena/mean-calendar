'use strict';

var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');
var idvalidator = require('mongoose-id-validator');

var ObjectId = mongoose.Schema.Types.ObjectId;

// unit tests use this require multiple times so can have this model already defined
// which gives an error
// TODO: a better way might be to delete the model before each test so it will be re-created.
// I have seen it done like this before but I want to use existing schema.

// beforeEach(function(done) {
//     if (mongoose.connection.models['User']) {
//         delete mongoose.connection.models['User'];
//     }
//
//     User = mongoose.model('User', mongoose.Schema({
//        ...
//     });
//
//     User.remove({}).exec().then(function () {
//         done();
//     });
// });

if(!mongoose.models.Session) {

  var sessionSchema = new mongoose.Schema({

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

  // sessionSchema.plugin(uniqueValidator, {
  //   message: 'Error, {PATH} {VALUE} must be unique.'
  // });

  // valdidate that user with specified id really exists
  sessionSchema.plugin(idvalidator, {
    message: 'Error, Invalid {PATH} {VALUE}.'
  });

  mongoose.model('Session', sessionSchema);
}

module.exports = mongoose.model('Session');
