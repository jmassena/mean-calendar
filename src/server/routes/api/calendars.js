'use strict';

var Calendar = require('../../db-models/calendar.js');
var exceptionMessages = require('../../common/exceptionMessages.js');
var auth = require('../../auth/auth.service');

var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/calendars/', auth.isAuthenticated(), list);
router.get('/calendars/:calendarId', auth.isAuthenticated(), get);
router.post('/calendars/', auth.isAuthenticated(), post);
router.put('/calendars/:calendarId', auth.isAuthenticated(), put);
router.delete('/calendars/:calendarId', auth.isAuthenticated(), del);

module.exports = router;

function list(req, res, next) {

  var query = Calendar.find({
    userId: req.user._id
  });

  query.exec()
    .then(function (calendars) {
      res.status(200).json(calendars);
    }, next);
}

function get(req, res, next) {

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
}

function post(req, res, next) {

  console.log('posted calendar');
  console.log(req.body);

  var newCalendar = new Calendar({
    userId: req.user._id,
    title: req.body.title,

    isDefault: req.body.isDefault
  });

  if(req.body.showEvents !== undefined) {
    newCalendar.showEvents = req.body.showEvents;
  }

  if(req.body.color !== undefined) {
    newCalendar.color = req.body.color;
  }

  console.log('new calendar');
  console.log(newCalendar);

  newCalendar.save()
    .then(function (calendar) {
      console.log('created calendar');
      console.log(calendar);
      res.location(path.join(req.baseUrl, 'calendars', calendar._id.toString()));
      res.status(201).json(calendar);
    })
    .then(null, next);
}

function put(req, res, next) {

  var calendarId = req.params.calendarId;

  var where = {
    _id: calendarId,
    userId: req.user.id
  };

  Calendar.findOneAndUpdate(where, {
      $set: {
        title: req.body.title,
        showEvents: req.body.showEvents,
        color: req.body.color
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
}

function del(req, res, next) {

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
}
