'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
// var userDAL = require('../data-access/user.js');
var User = require('../db-models/user.js');

var validateJwt = expressJwt({
  secret: config.secrets.tokenSecret
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 401
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function (req, res, next) {

      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        /*jshint camelcase:false*/
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }

      //console.log('isAuthenticated request Authorization');
      // console.log('token header: ' + req.headers.authorization);
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function (req, res, next) {
      // console.log('running isAuthenticated.getById');

      // console.log('authentication getting user ' + req.user._id);

      User.findById(req.user._id)
        // .select('-hashedPassword -salt')
        .exec()
        .then(function (user) {
          if(!user) {
            return res.sendStatus(404);
          }
          req.user = user;
          next();
        }, function (err) {
          return next(err);
        });

    });
}

// /**
//  * Checks if the user role meets the minimum requirements of the route
//  */
// function hasRole(roleRequired) {
//   if(!roleRequired) throw new Error('Required role needs to be set');
//
//   return compose()
//     .use(isAuthenticated())
//     .use(function meetsRequirements(req, res, next) {
//       if(config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
//         next();
//       } else {
//         res.send(403);
//       }
//     });
// }

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({
    _id: id
  }, config.secrets.tokenSecret, {
    expiresInMinutes: 60 * 5
      // for testing
      // expiresInMinutes: 1
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {

  if(!req.user) {
    return res.status(404).json({
      message: 'Error occurred'
    });
  }

  var token = signToken(req.user._id);
  res.cookie('token', token);
  console.log('token: ' + token);
  res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
// exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
