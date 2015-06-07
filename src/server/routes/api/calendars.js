'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Calendar = require('../../db-models/calendar.js');
// var routeUtils = require('../routeUtils.js');
var exceptionMessages = require('../../common/exceptionMessages.js');
var auth = require('../../auth/auth.service');
var path = require('path');

module.exports = router;

// GET list for user
router.get('/users/:userId/calendars/', auth.isAuthenticated(), function (req, res, next) {

  var userId = req.params.userId;
  // // user's calendars can be filtered by title
  // var title = req.query.title;
  // might want just a list of calendars without events
  var includeEvents = req.query.includeEvents;

  if(userId !== req.user.id) {
    console.log('param id: ' + userId + ' authenticated userId: ' + req.user.id);
    return next(exceptionMessages.error('permission_denied'));
  }

  var query = Calendar.find({
    userId: userId
  });

  if(!includeEvents) {
    query.select('userId type title eventTypeColors');
  }

  query.exec()
    .then(function (calendars) {
      res.status(200).json(calendars);
    }, next);
});

// GET one
router.get('/users/:userId/calendars/:calendarId', auth.isAuthenticated(), function (req, res, next) {

  var userId = req.params.userId;
  var calendarId = req.params.calendarId;

  Calendar.findById(calendarId).exec()
    .then(function (calendar) {
      res.status(200).json(calendar);
    }, next);
});

// POST create a new calendar
router.post('/users/:userId/calendars/', auth.isAuthenticated(), function (req, res, next) {

  console.log('calling route: ' + 'POST /users/:userId/calendars/');

  var userId = req.params.userId;
  var calendarType = 'user';
  var title = req.body.title || 'Default';

  if(userId !== req.user.id) {
    console.log('param id: ' + userId + ' authenticated userId: ' + req.user.id);
    return next(exceptionMessages.error('permission_denied'));
  }

  var calendar = new Calendar({
    userId: userId,
    calendarType: calendarType,
    title: title
  });

  // TODO: when saving calendar need to validate that only one calendar for user
  // is set default:true
  calendar.save()
    .then(function (calendar) {
      res.status(200).json(calendar);
    }, next);
});

// PUT update a calendar. will update title, default, eventTypeColors, not events.
router.put('/users/:userId/calendars/:calendarId', auth.isAuthenticated(), function (req, res, next) {

  console.log('calling route: ' + 'PUT /users/:userId/calendars/:calendarId');

  var userId = req.params.userId;
  var calendarId = req.params.calendarId;
  // var calendarType = 'user';
  var title = req.body.title;
  var defaultCalendar = req.body.defaultCalendar;
  var eventTypeColors = req.body.eventTypeColors;

  // TODO: make middleware for IsUpdatingSelfOrIsAdmin
  if(userId !== req.user.id) {
    console.log('param id: ' + userId + ' authenticated userId: ' + req.user.id);
    return next(exceptionMessages.error('permission_denied'));
  }

  var promise;
  if(defaultCalendar) {
    // clear default flag for other calendars if this updated cal is default
    promise = Calendar.update({
      userId: userId,
      _id: {
        $ne: calendarId
      }
    }, {
      $set: {
        defaultCalendar: false
      }

    }, {
      multi: true
    }).exec();
  } else {
    promise = new mongoose.Promise();
    promise.fulfill();
  }

  promise.then(function () {
      return Calendar.update({
        _id: calendarId
      }, {
        $set: {
          title: title,
          defaultCalendar: defaultCalendar,
          eventTypeColors: eventTypeColors
        }
      }, {
        new: true,
        runValidators: true
      });
    })
    .then(function (calendar) {
      res.status(200).json(calendar);
    }, next);
});
