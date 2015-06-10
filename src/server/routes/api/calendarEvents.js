'use strict';

var express = require('express');
var router = express.Router();
// var mongoose = require('mongoose');
// var Calendar = require('../../db-models/calendar.js');
var CalendarEvent = require('../../db-models/calendarEvent.js');
// var routeUtils = require('../routeUtils.js');
var exceptionMessages = require('../../common/exceptionMessages.js');
var auth = require('../../auth/auth.service');
// var path = require('path');

module.exports = router;

// GET get events for calendar
router.get('/calendars/:calendarId/events/', auth.isAuthenticated(), function (req, res, next) {

  console.log('calling route: ' + 'GET /calendars/events');

  var calendarId = req.params.calendarId;

  var queryStart = req.query.start;
  var queryEnd = req.query.end;

  if(!queryStart && !queryEnd) {
    return CalendarEvent.find({
        calendarId: calendarId,
        userId: req.user.id
      })
      .then(function (events) {
        res.status(200).json(events);
      }, next);
  }

  queryStart = queryStart || new Date(-8640000000000000);
  queryEnd = queryEnd || new Date(8640000000000000);

  CalendarEvent.find({
      calendarId: calendarId,
      userId: req.user.id,
      // 3 cases: event straddles query start or end. event straddles query start and end.
      // event start is between query start/end
      // event end is between query start/end
      // event end is greater than query end and event start is less than query end
      $or: [{
        $and: [{
          start: {
            $gte: queryStart
          }
        }, {
          start: {
            $lt: queryEnd
          }
        }]
      }, {
        $and: [{
          end: {
            $gt: queryStart
          }
        }, {
          end: {
            $lte: queryEnd
          }
        }]
      }, {
        $and: [{
          start: {
            $lt: queryStart
          }
        }, {
          end: {
            $gt: queryEnd
          }
        }]
      }]
    })
    .then(function (events) {
      res.status(200).json(events);
    }, next);

});

// POST create a new calendar event
router.post('/calendars/:calendarId/events/', auth.isAuthenticated(), function (req, res, next) {

  console.log('calling route: ' + 'POST /calendars/events');

  var calendarId = req.params.calendarId;

  var calendarEvent = new CalendarEvent(req.body);

  calendarEvent.calendarId = calendarId;
  calendarEvent.userId = req.user.id;

  calendarEvent.save()
    .then(function (event) {
      res.status(201).json(event);
    }, next);

});

// PUT update a calendar event
router.put('/calendars/:calendarId/events/:eventId', auth.isAuthenticated(), function (req, res, next) {

  console.log('calling route: ' + 'PUT /calendars/events/:eventId');

  var calendarId = req.params.calendarId;
  var eventId = req.params.eventId;
  var userId = req.user.id;

  var where = {
    _id: eventId,
    calendarId: calendarId,
    userId: userId
  };

  // TODO: check if start/end dates are valid dates also.
  // I think date will be type string.

  var start = Date.parse(req.body.start);
  var end = Date.parse(req.body.end);

  if(!start || !end) {

    console.log('start: ' + start + ' orig: ' + req.body.start);
    console.log('end: ' + end + ' orig: ' + req.body.end);

    return next(exceptionMessages.error('system_validation_failure', null,
      'Start and end dates are required'));
  }

  CalendarEvent.findOneAndUpdate(where, {
      $set: {
        start: start,
        end: end,
        allDay: req.body.allDay,
        title: req.body.title,
        notes: req.body.notes,
        label: req.body.label
      }
    }, {
      new: true,
      runValidators: true
    }).exec()
    .then(function (event) {
      if(!event) {
        // TODO: change error() function to stringify objects/arrays if passed as message args.
        throw exceptionMessages.error('object_not_found', null, JSON.stringify(where));
      }
      return event;
    })
    .then(function (event) {
      res.status(200).json(event);
    }, next);
});

// DELETE calendar event
router.delete('/calendars/:calendarId/events/:eventId', auth.isAuthenticated(), function (req, res, next) {

  console.log('calling route: ' + 'DELETE /calendars/events/:eventId');

  var calendarId = req.params.calendarId;
  var eventId = req.params.eventId;
  var userId = req.user.id;

  var where = {
    _id: eventId,
    calendarId: calendarId,
    userId: userId
  };

  CalendarEvent.findOneAndRemove(where).exec()
    .then(function (event) {
      if(!event) {
        throw exceptionMessages.error('object_not_found', null, JSON.stringify(where));
      }
      return event;
    })
    .then(function (event) {
      res.status(200).json(event);
    }, next);
});
