'use strict';

var mongoose = require('mongoose');

if(!mongoose.models.CalendarEvent) {

  var CalendarEventSchema = new mongoose.Schema({

    startDateTime: {
      type: Date,
      required: true
    },
    endDateTime: {
      type: Date,
      required: true,
      validate: [endDateRangeValidator, 'End date must be equal or greater than start date']
    },
    type: {
      type: String // arbitrary name user can assign or list we create in ui
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    allDay: {
      type: Boolean
    }
    // notifyDateTime
    // location
  });

  mongoose.model('CalendarEvent', CalendarEventSchema);

}

function endDateRangeValidator(value) {
  return this.startDateTime <= value;
}

module.exports = mongoose.models.CalendarEvent;
