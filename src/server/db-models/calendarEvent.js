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

    // arbitrary label so we can color different types of events
    label: {
      type: String
    },

    color: {
      type: String
    }
  });

  // we will always look up events by calendarId + userId at least.
  // then probably with some date range.
  // So it might make sense to add the dates to this index instead of a separate index.
  CalendarEventSchema.index({
    calendarId: 1,
    userId: 1,
    start: 1,
    end: 1
  }, {
    unique: false
  });

  // CalendarEventSchema.index({
  //   start: 1,
  //   end: 1
  // }, {
  //   unique: false
  // });

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

// CalendarEventSchema.pre('save', datesValidate);
// CalendarEventSchema.pre('findOneAndUpdate', updateDatesValidate);
// CalendarEventSchema.pre('update', updateDatesValidate);

// function datesValidate(next) {
//   // console.log('Validating dates');
//   /*jshint validthis:true */
//
//   CalendarEventSchema.datesValidate(this.start.date,
//     this.start.dateTime)
//
//   console.log('datesValidate this.start');
//   console.log(this.start);
//   var errors = [];
//   if(!this.start.date && !this.start.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Start date is required'));
//   }
//
//   if(!this.end.date && !this.end.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'End date is required'));
//   }
//
//   if(this.start.date && !this.end.date ||
//     this.end.date && !this.start.date) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'If one all-day date is set then both start.date and end.date must be set'));
//   }
//
//   if(this.start.date && this.start.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Cannot have both start.date and start.dateTime'));
//   }
//
//   if(this.end.date && this.end.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Cannot have both end.date and end.dateTime'));
//   }
//
//   var start = this.start.date || this.start.dateTime;
//   var end = this.end.date || this.end.dateTime;
//
//   if(start && end && start > end) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Start date cannot be greater than end date'));
//   }
//
//   if(errors.length > 0) {
//     var e = new Error('CalendarEvent date validation failed');
//     e.errors = errors;
//     return next(e);
//   }
//   next();
// }
//

//
//
// CalendarEventSchema.statics.datesValidate = function (startDate,
//   startDateTime, endDate, endDateTime) {
//   /*jshint maxcomplexity:11 */
//
//   var errors = [];
//   if(!this.start.date && !this.start.dateTime) {
//     errors.push('Start date is required');
//   }
//
//   if(!this.end.date && !this.end.dateTime) {
//     errors.push('End date is required');
//   }
//
//   if(this.start.date && !this.end.date ||
//     this.end.date && !this.start.date) {
//     errors.push('If one all-day date is set then both start.date and end.date must be set');
//   }
//
//   if(this.start.date && this.start.dateTime) {
//     errors.push('Cannot have both start.date and start.dateTime');
//   }
//
//   if(this.end.date && this.end.dateTime) {
//     errors.push('Cannot have both end.date and end.dateTime');
//   }
//
//   var start = this.start.date || this.start.dateTime;
//   var end = this.end.date || this.end.dateTime;
//
//   if(start && end && start > end) {
//     errors.push('Start date cannot be greater than end date');
//   }
//
//   if(errors.length > 0) {
//     var err = new Error('CalendarEvent date validation failed');
//     err.message += errors.map(function (val) {
//       return '. ' + val;
//     });
//
//     return err;
//   }
//
//   return null;
// };

//
// function datesValidate(next) {
//   // console.log('Validating dates');
//   /*jshint validthis:true */
//   /*jshint maxcomplexity:11 */
//
//   console.log('datesValidate this.start');
//   console.log(this.start);
//   var errors = [];
//   if(!this.start.date && !this.start.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Start date is required'));
//   }
//
//   if(!this.end.date && !this.end.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'End date is required'));
//   }
//
//   if(this.start.date && !this.end.date ||
//     this.end.date && !this.start.date) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'If one all-day date is set then both start.date and end.date must be set'));
//   }
//
//   if(this.start.date && this.start.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Cannot have both start.date and start.dateTime'));
//   }
//
//   if(this.end.date && this.end.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Cannot have both end.date and end.dateTime'));
//   }
//
//   var start = this.start.date || this.start.dateTime;
//   var end = this.end.date || this.end.dateTime;
//
//   if(start && end && start > end) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Start date cannot be greater than end date'));
//   }
//
//   if(errors.length > 0) {
//     var e = new Error('CalendarEvent date validation failed');
//     e.errors = errors;
//     return next(e);
//   }
//   next();
// }
//
//
// function updateDatesValidate(next) {
//   // console.log('Validating dates');
//   /*jshint validthis:true */
//   /*jshint maxcomplexity:11 */
//
//   console.log('datesValidate this._update.$set[\'start.date\']');
//   console.log(this._update.$set['start.date']);
//   var errors = [];
//   if(!this._update.$set.start.date && !this._update.$set.start.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Start date is required'));
//   }
//
//   if(!this.end.date && !this.end.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'End date is required'));
//   }
//
//   if(this.start.date && !this.end.date ||
//     this.end.date && !this.start.date) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'If one all-day date is set then both start.date and end.date must be set'));
//   }
//
//   if(this.start.date && this.start.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Cannot have both start.date and start.dateTime'));
//   }
//
//   if(this.end.date && this.end.dateTime) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Cannot have both end.date and end.dateTime'));
//   }
//
//   var start = this.start.date || this.start.dateTime;
//   var end = this.end.date || this.end.dateTime;
//
//   if(start && end && start > end) {
//     errors.push(exceptionMessages.error('system_validation_failure', null,
//       'Start date cannot be greater than end date'));
//   }
//
//   if(errors.length > 0) {
//     var e = new Error('CalendarEvent date validation failed');
//     e.errors = errors;
//     return next(e);
//   }
//   next();
// }
