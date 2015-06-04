'use strict';

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var userDAL = require('../../data-access/user.js');
var config = require('../../config/environment');

module.exports.setup = function () {

  passport.use(new GoogleStrategy({

      clientID: config.secrets.google.clientID,
      clientSecret: config.secrets.google.clientSecret,
      callbackURL: config.secrets.google.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {

      console.log('google called back!');

      userDAL.Model.findOne({
          'google.id': profile.id
        })
        .exec()
        .then(function (user) {
          if(!user) {
            console.log('creating new user for google user');
            console.log(profile._json);

            user = new userDAL.Model({
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              provider: 'google',
              google: profile._json
            });

            return user.save();
          } else {
            console.log('found existin user for google user');
            return user;
          }
        })
        .then(function (user) {
          console.log('new user created/found for google user');
          return done(null, user);

        }, function (err) {
          console.log('error while creating new user for google user');
          console.log(err);
          return done(err);
        });
    }
  ));
};
