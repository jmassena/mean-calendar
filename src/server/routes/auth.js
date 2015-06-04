/*jslint node: true */
'use strict';

var router = require('express').Router();
var auth = require('../auth/auth.service');
var exceptionMessages = require('../common/exceptionMessages');

module.exports = function (passport) {

  router.post('/auth/local', passport.authenticate('local', {
    // failureRedirect: '/register',
    session: false
  }), auth.setTokenCookie);

  router.get('/auth/google', passport.authenticate('google', {
    // failureRedirect: '/register',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    session: false
  }));

  router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }), auth.setTokenCookie);

  return router;
};
