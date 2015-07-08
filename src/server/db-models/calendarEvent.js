'use strict';

var mongoose = require('mongoose');
var exceptionMessages = require('../common/exceptionMessages.js');

if(!mongoose.models.CalendarEvent) {

  var CalendarEventSchema = new mongoose.Schema({

    calendarId: {
      type: mongoose.Schema.Types.ObjectId
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    start: {
      type: Date,
      required: true
    },

    end: {
      type: Date,
      required: true
    },

    allDay: {
      type: Boolean
    },

    title: {
      type: String,
      required: true
    },

    notes: {
      type: String
    },
  });

  CalendarEventSchema.index({
    calendarId: 1,
    userId: 1,
    start: 1,
    end: 1
  }, {
    unique: false
  });

  CalendarEventSchema
    .path('end')
    .validate(function (value) {
      if(value && this.start) {
        return value >= this.start;
      }

      return false;
    }, 'End date must be equal or greater than start date');

  mongoose.model('CalendarEvent', CalendarEventSchema);

}

module.exports = mongoose.models.CalendarEvent;
