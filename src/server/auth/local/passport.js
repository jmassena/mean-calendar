'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// var userDAL = require('../../data-access/user.js');
var User = require('../../db-models/user.js');
var config = require('../../config/environment');

var exceptionMessages = require('../../common/exceptionMessages.js');

module.exports.setup = function () {

  passport.use(new LocalStrategy({

      usernameField: 'userName',
      passwordField: 'password'
    },
    function (userName, password, done) {

      User.findOne({
          userName: userName
        })
        .select('+hashedPassword +salt').exec()
        .then(function (user) {
          if(!user || !user.authenticate(password)) {
            var error = exceptionMessages.createError('username_or_password_not_found');
            error.statusCode = 404;
            throw error;
          }
          return user;
        })
        .then(function (user) {
            return done(null, user);
          },
          function (err) {
            console.log(err);
            done(err);
          });
    }
  ));
};
