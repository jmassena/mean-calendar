'use strict';

var mongoose = require('mongoose');

var calendarType = ['user', 'holidays'];

if(!mongoose.models.Calendar) {

  var CalendarSchema = new mongoose.Schema({

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    config: {
      showEvents: {
        type: Boolean,
        default: true
      },

      eventColor: {
        type: String,
        default: '#9A9CFF'
      }
    }
  });

  mongoose.model('Calendar', CalendarSchema);

}

module.exports = mongoose.model('Calendar');
