'use strict';

var express = require('express');
var router = express.Router();
// var mongoose = require('mongoose');
var Calendar = require('../../db-models/calendar.js');
// var routeUtils = require('../routeUtils.js');
var exceptionMessages = require('../../common/exceptionMessages.js');
var auth = require('../../auth/auth.service');
var path = require('path');

module.exports = router;

// list
// GET list for user
router.get('/calendars/', auth.isAuthenticated(), function (req, res, next) {

  //console.log('calling route: ' + 'GET /calendars/');

  var userId = req.params.userId;

  var query = Calendar.find({
    userId: req.user._id
  });

  query.exec()
    .then(function (calendars) {
      res.status(200).json(calendars);
    }, next);
});

// get
// GET one
router.get('/calendars/:calendarId', auth.isAuthenticated(), function (req, res, next) {

  //console.log('calling route: ' + 'GET /calendars/:calendarId');

  var calendarId = req.params.calendarId;

  var where = {
    _id: calendarId,
    userId: req.user._id
  };

  Calendar.findOne(where).exec()
    .then(function (calendar) {
      if(!calendar) {
        throw exceptionMessages.error('object_not_found', null, JSON.stringify(where));
      }
      res.status(200).json(calendar);
    })
    .then(null, next);
});

// insert
// POST create a new calendar
router.post('/calendars/', auth.isAuthenticated(), function (req, res, next) {

  //console.log('calling route: ' + 'POST /calendars/');

  var title = req.body.title;
  var config = req.body.config;

  //console.log(config);

  var calendar = new Calendar({
    userId: req.user._id,
    title: title,
    config: config
  });

  //console.log('new calendar');
  //console.log(calendar);

  calendar.save()
    .then(function (calendar) {
      res.location(path.join(req.baseUrl, 'calendars', calendar._id.toString()));
      res.status(201).json(calendar);
    })
    .then(null, next);
});

// update
// PUT update a calendar. will update title, config
router.put('/calendars/:calendarId', auth.isAuthenticated(), function (req, res, next) {

  // //console.log('calling route: ' + 'PUT /calendars/:calendarId');

  var calendarId = req.params.calendarId;
  var title = req.body.title;
  var config = req.body.config;

  var where = {
    _id: calendarId,
    userId: req.user.id
  };

  Calendar.findOneAndUpdate(where, {
      $set: {
        title: title,
        'config.showEvents': config.showEvents,
        'config.eventColor': config.eventColor
      }
    }, {
      new: true,
      runValidators: true
    })
    .then(function (calendar) {
      //console.log('calendar not found');
      if(!calendar) {
        throw exceptionMessages.error('object_not_found', null, JSON.stringify(where));
      }
      return calendar;
    })
    .then(function (calendar) {
      res.status(200).json(calendar);
    }, next);

});

// delete
router.delete('/calendars/:calendarId', auth.isAuthenticated(), function (req, res, next) {

  // //console.log('calling route: ' + 'DELETE /calendars/:calendarId');

  var calendarId = req.params.calendarId;

  var where = {
    _id: calendarId,
    userId: req.user.id
  };

  Calendar.findOneAndRemove(where)
    .then(function (calendar) {
      if(!calendar) {
        throw exceptionMessages.error('object_not_found', null, JSON.stringify(where));
      }
      return calendar;
    })
    .then(function (calendar) {
      res.status(200).json(calendar);
    }, next);

});
