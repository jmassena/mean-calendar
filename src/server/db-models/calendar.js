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
        type: Boolean
      },
      // hash of type:color
      eventLabelColors: {
        type: mongoose.Schema.Types.Mixed
      }
    }
  });
  // //
  // // // validate if this calendar is not default then some other calendar is default
  // // CalendarSchema
  // //   .path('defaultCalendar')
  // //   .validate(function (value, cb) {
  // //
  // //     if(value) {
  // //       return cb(true);
  // //     }
  // //
  // //     mongoose.model('CalendarEvent')
  // //       .findOne({
  // //         userId: this.userId,
  // //         defaultCalendar: true
  // //       }).exec()
  // //       .then(function (cal) {
  // //         if(!cal) {
  // //           return cb(false);
  // //         }
  // //         cb(true);
  // //       }, function (err) {
  // //         console.log('error checking for default calendar settings');
  // //         console.log(err);
  // //         cb(false);
  // //       });
  // //   });
  //
  // CalendarSchema.pre('save', defaultCalendarClear);
  // CalendarSchema.pre('update', defaultCalendarClear);

  mongoose.model('Calendar', CalendarSchema);

}
//
// function defaultCalendarClear(next) {
//   /*jshint validthis:true */
//
//   if(this.defaultCalendar) {
//     mongoose.model('CalendarEvent')
//       .update({
//         userId: this.userId,
//         defaultCalendar: true
//       }, {
//         $set: {
//           defaultCalendar: false
//         }
//       })
//       .exec()
//       .then(next, next);
//   }
// }

module.exports = mongoose.model('Calendar');
