'use strict';

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// var userDAL = require('../../data-access/user.js');
var User = require('../../db-models/user.js');
var config = require('../../config/environment');

module.exports.setup = function () {

  passport.use(new GoogleStrategy({

      clientID: config.secrets.google.clientID,
      clientSecret: config.secrets.google.clientSecret,
      callbackURL: config.secrets.google.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {

      User.findOne({
          'google.id': profile.id
        })
        .exec()
        .then(function (user) {
          if(!user) {
            user = new User({
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              provider: 'google',
              google: profile._json
            });

            return user.save();
          } else {
            return user;
          }
        })
        .then(function (user) {
          return done(null, user);

        }, function (err) {
          return done(err);
        });
    }
  ));
};
