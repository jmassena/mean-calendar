'use strict';

var CalendarEvent = require('../../db-models/calendarEvent.js');
var exceptionMessages = require('../../common/exceptionMessages.js');
var auth = require('../../auth/auth.service');

var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/calendars/:calendarId/events', auth.isAuthenticated(), list);
router.get('/calendars/:calendarId/events/:eventId', auth.isAuthenticated(), get);
router.post('/calendars/:calendarId/events', auth.isAuthenticated(), post);
router.put('/calendars/:calendarId/events/:eventId', auth.isAuthenticated(), put);
router.delete('/calendars/:calendarId/events/:eventId', auth.isAuthenticated(), del);

module.exports = router;

function list(req, res, next) {

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

  var tmp;

  if(queryStart) {
    tmp = Date.parse(queryStart);
    if(isNaN(tmp)) {
      throw exceptionMessages.error('system_validation_failure', null, 'invalid start date: ' +
        queryStart);
    }
    queryStart = new Date(tmp);
  } else {
    queryStart = new Date(-8640000000000000);
  }

  if(queryEnd) {
    tmp = Date.parse(queryEnd);
    if(isNaN(tmp)) {
      throw exceptionMessages.error('system_validation_failure', null, 'invalid end date: ' +
        queryEnd);
    }
    queryEnd = new Date(tmp);
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

      // console.log(events);
      res.status(200).json({
        calendarId: calendarId,
        events: events
      });
    }, next);

}

function get(req, res, next) {

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

}

function post(req, res, next) {

  var calendarId = req.params.calendarId;

  var calendarEvent = new CalendarEvent(req.body);

  calendarEvent.calendarId = calendarId;
  calendarEvent.userId = req.user.id;

  // console.log(calendarEvent);

  calendarEvent.save()
    .then(function (event) {
      res.location(path.join(req.baseUrl, 'calendars', calendarId, 'events', event.id));
      res.status(201).json(
        event);
    })
    .then(null, next);

}

function put(req, res, next) {

  var calendarId = req.params.calendarId;
  var eventId = req.params.eventId;
  var userId = req.user.id;

  var where = {
    _id: eventId,
    userId: userId
  };

  var start = Date.parse(req.body.start);
  var end = Date.parse(req.body.end);

  if(!start || !end) {
    return next(exceptionMessages.error('system_validation_failure', null,
      'Start and end dates are required'));
  }

  CalendarEvent.findOneAndUpdate(where, {
      $set: {
        calendarId: calendarId,
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
}

function del(req, res, next) {

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
}
