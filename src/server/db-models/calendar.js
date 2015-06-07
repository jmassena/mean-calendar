'use strict';

var mongoose = require('mongoose');
var CalendarEvent = require('./calendarEvent');

var calendarType = ['user', 'holidays'];

if(!mongoose.models.Calendar) {

  var CalendarSchema = new mongoose.Schema({

    userId: {
      type: mongoose.Schema.Types.ObjectId
    },

    type: {
      type: String,
      enum: calendarType,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    defaultCalendar: {
      type: Boolean
    },

    eventTypeColors: {}, //  hash of {typeName:color}

    events: {
      type: [CalendarEvent.schema]
    }
  });

  CalendarSchema.index({
    'events._id': 1
  });

  // CalendarSchema.statics.updateCalendarEvent = function (calendarId, eventId, start, end, allDay, type, title,
  //   description) {
  //   return this.findOneAndUpdate({
  //       _id: calendarId,
  //       'events._id': eventId
  //     }, {
  //       '$set': {
  //         'events.$startDateTime': start,
  //         'events.$endDateTime': end,
  //         'events.$allDay': allDay,
  //         'events.$type': type,
  //         'events.$title': title,
  //         'events.$description': description
  //       }
  //     }, {
  //       runValidators: true
  //     })
  //     .exec();
  // };

  mongoose.model('Calendar', CalendarSchema);

}

module.exports = mongoose.model('Calendar');
