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

    showEvents: {
      type: Boolean,
      default: true
    },

    color: {
      type: String,
      default: '#9A9CFF',
      required: true
    },

    isDefault: {
      type: Boolean,
      default: false
    }
  });

  mongoose.model('Calendar', CalendarSchema);

}

module.exports = mongoose.model('Calendar');
