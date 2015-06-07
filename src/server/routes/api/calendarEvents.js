'use strict';

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Calendar = require('../../db-models/calendar.js');
var CalendarEvent = require('../../db-models/calendarEvent.js');
// var routeUtils = require('../routeUtils.js');
var exceptionMessages = require('../../common/exceptionMessages.js');
var auth = require('../../auth/auth.service');
var path = require('path');

module.exports = router;

// POST create a new calendar event
router.post('/users/:userId/calendars/:calendarId/events/', auth.isAuthenticated(), function (req, res, next) {

  console.log('calling route: ' + 'POST /users/:userId/calendars/events');

  var userId = req.params.userId;
  var calendarId = req.params.calendarId;

  if(userId !== req.user.id) {
    console.log('param id: ' + userId + ' authenticated userId: ' + req.user.id);
    return next(exceptionMessages.error('permission_denied'));
  }

  // TODO: This is inefficient getting the document and saving just to do an update.
  // Either implement the update validator (if you can get set to work when adding to an array on update)
  // or do the validation manually preferably by calling the CalendarEvent instance validate function
  // so we can just do an update statement.

  Calendar.findOne({
      _id: calendarId,
      userId: userId
    }).exec()
    .then(function (calendar) {
      if(!calendar) {
        throw exceptionMessages.error('object_not_found_by_id');
      }
      // TODO: delete this line. it was just while developing to fix bad data
      calendar.type = calendar.type || 'user';
      calendar.events.push(new CalendarEvent(req.body));

      return calendar.save();
    })
    .then(function (calendar) {
      res.status(201).json(calendar);
    }, next);

});

// PUT update a calendar event
router.put('/users/:userId/calendars/:calendarId/events/:eventId', auth.isAuthenticated(), function (req, res, next) {

  console.log('calling route: ' + 'PUT /users/:userId/calendars/events/:eventId');

  var userId = req.params.userId;
  var calendarId = req.params.calendarId;
  var eventId = req.params.eventId;

  if(userId !== req.user.id) {
    console.log('param id: ' + userId + ' authenticated userId: ' + req.user.id);
    return next(exceptionMessages.error('permission_denied'));
  }

  var where = {
    _id: calendarId,
    userId: userId,
    'events._id': eventId
  };

  // NOTE: I am updating specific properties of the event so we don't lose the id
  // but then we return all events so does it even matter if we lose the id?
  // Think of this as prep for when I
  Calendar.findOneAndUpdate(where, {
      $set: {
        'events.$.startDateTime': req.body.startDateTime,
        'events.$.endDateTime': req.body.endDateTime,
        'events.$.type': req.body.type,
        'events.$.title': req.body.title,
        'events.$.description': req.body.description,
        'events.$.allDay': req.body.allDay,
      }
    }, {
      new: true,
      runValidators: true
    }).exec()
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

// DELETE create a new calendar event
router.delete('/users/:userId/calendars/:calendarId/events/:eventId', auth.isAuthenticated(), function (req, res, next) {

  console.log('calling route: ' + 'DELETE /users/:userId/calendars/events/:eventId');

  var userId = req.params.userId;
  var calendarId = req.params.calendarId;
  var eventId = req.params.eventId;

  if(userId !== req.user.id) {
    console.log('param id: ' + userId + ' authenticated userId: ' + req.user.id);
    return next(exceptionMessages.error('permission_denied'));
  }

  var where = {
    _id: calendarId,
    userId: userId,
    'events._id': eventId
  };

  Calendar.findOneAndUpdate(where, {
      $pull: {
        events: {
          _id: eventId
        }
      }
    }, {
      new: true
    }).exec()
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
