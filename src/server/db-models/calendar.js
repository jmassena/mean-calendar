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
      // hash of type:color
      eventLabelColors: {
        type: mongoose.Schema.Types.Mixed
      }
    }
  });

  mongoose.model('Calendar', CalendarSchema);

}

module.exports = mongoose.model('Calendar');
