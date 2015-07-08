// routes.api.users.js
/*jslint node: true */
'use strict';

var User = require('../../data-access/user.js');
var routeUtils = require('../routeUtils.js');
var exceptionMessages = require('../../common/exceptionMessages.js');
var auth = require('../../auth/auth.service');

var path = require('path');
var express = require('express');
var router = express.Router();

router.get('/users', auth.isAuthenticated(), list);
router.get('/users/me', auth.isAuthenticated(), getMe);
router.get('/users/:userId', auth.isAuthenticated(), get);
router.post('/users/', post);
router.put('/users/:userId', auth.isAuthenticated(), put);
router.delete('/users/:userId', auth.isAuthenticated(), del);

module.exports = router;

function list(req, res, next) {

  User.get({})
    .then(routeUtils.onSuccess(200, res),
      routeUtils.onError(500, res));
}

function getMe(req, res, next) {

  User.getById(req.user._id)
    .then(routeUtils.onSuccess(200, res),
      routeUtils.onError(500, res));
}

function get(req, res, next) {

  var userId = req.params.userId;
  User.getById(userId)
    .then(function (data) {
      if(!data) {
        var error = exceptionMessages.createError('user_not_found_for_id');
        error.statusCode = 404;
        throw error;
      }

      return res.status(200).json(data);
    })
    .then(null, next);
}

function post(req, res, next) {

  User.create(req.body) // 201: created
    .then(function (data) {
        res
          .location(path.join(req.baseUrl, 'users', data._id.toString()))
          .status(201)
          .json(data);
      },
      routeUtils.onError(500, res));
}

function del(req, res, next) {

  var userId = req.params.userId;

  User.deleteById(userId) //204 No Content
    .then(routeUtils.onSuccess(204, res),
      routeUtils.onError(500, res));
}

function put(req, res, next) {

  var userId = req.params.userId;
  var user = req.body;

  if(user._id == null) {
    user._id = userId;
  } else if(user._id.toString() !== userId.toString()) {

    var debugInfo = 'object _id: ' + user._id + ' path id: ' + userId;
    var error = exceptionMessages.createError('path_id_differs_from_object_id', null, debugInfo);
    error.statusCode = 422;
    return next(error);
  }

  User.update(user)
    .then(routeUtils.onSuccess(200, res),
      routeUtils.onError(500, res));

}
