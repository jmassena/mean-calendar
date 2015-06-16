'use strict';

var express = require('express');
var router = express.Router();
// var mongoose = require('mongoose');
// var Calendar = require('../../db-models/calendar.js');
var CalendarEvent = require('../../db-models/calendarEvent.js');
// var routeUtils = require('../routeUtils.js');
var exceptionMessages = require('../../common/exceptionMessages.js');
var auth = require('../../auth/auth.service');
var path = require('path');

module.exports = router;

// GET get events for calendar
router.get('/calendars/:calendarId/events/', auth.isAuthenticated(), function (req, res, next) {

  //console.log('calling route: ' + 'GET /calendars/events');

  var calendarId = req.params.calendarId;

  var queryStart = req.query.start;
  var queryEnd = req.query.end;

  // //console.log('query start: ' + queryStart);
  // //console.log('query end: ' + queryEnd);

  if(!queryStart && !queryEnd) {
    // //console.log('Find events with no date range');
    return CalendarEvent.find({
        calendarId: calendarId,
        userId: req.user.id
      })
      .then(function (events) {
        res.status(200).json(events);
      }, next);
  }

  if(queryStart) {
    var tmp = Date.parse(queryStart);
    if(isNaN(tmp)) {
      throw exceptionMessages.error('system_validation_failure', null, 'invalid start date: ' + queryStart);
    }
  } else {
    queryStart = new Date(-8640000000000000);
  }

  if(queryEnd) {
    var tmp = Date.parse(queryEnd);
    if(isNaN(tmp)) {
      throw exceptionMessages.error('system_validation_failure', null, 'invalid end date: ' + queryEnd);
    }
    queryEnd = new Date(tmp);
    //console.log('query end: ' + queryEnd);
  } else {
    queryEnd = new Date(8640000000000000);
  }

  CalendarEvent.find({
      calendarId: calendarId,
      userId: req.user.id,
      $and: [{
        start: {
          $lt: queryEnd
        }
      }, {
        end: {
          $gt: queryStart
        }
      }]
    })
    .then(function (events) {
      res.status(200).json(events);
    }, next);

});

// GET one event for calendar
router.get('/calendars/:calendarId/events/:eventId', auth.isAuthenticated(), function (req, res, next) {

  //console.log('calling route: ' + 'GET /calendars/events');

  var calendarId = req.params.calendarId;
  var eventId = req.params.eventId;

  var where = {
    calendarId: calendarId,
    userId: req.user.id,
    _id: eventId
  };

  CalendarEvent.findOne(where)
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

// POST create a new calendar event
router.post('/calendars/:calendarId/events/', auth.isAuthenticated(), function (req, res, next) {

  //console.log('calling route: ' + 'POST /calendars/events');

  var calendarId = req.params.calendarId;

  var calendarEvent = new CalendarEvent(req.body);

  calendarEvent.calendarId = calendarId;
  calendarEvent.userId = req.user.id;

  console.log(calendarEvent);

  calendarEvent.save()
    .then(function (event) {
      res.location(path.join(req.baseUrl, 'calendars', calendarId, 'events', event.id));
      res.status(201).json(
        event);
    })
    .then(null, next);

});

// PUT update a calendar event
router.put('/calendars/:calendarId/events/:eventId', auth.isAuthenticated(), function (req, res, next) {

  //console.log('calling route: ' + 'PUT /calendars/events/:eventId');

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

    //console.log('start: ' + start + ' orig: ' + req.body.start);
    //console.log('end: ' + end + ' orig: ' + req.body.end);

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

  //console.log('calling route: ' + 'DELETE /calendars/events/:eventId');

  var calendarId = req.params.calendarId;
  var eventId = req.params.eventId;
  var userId = req.user.id;

  var where = {
    _id: eventId,
    calendarId: calendarId,
    userId: userId
  };

  CalendarEvent.findOneAndRemove(where)
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
