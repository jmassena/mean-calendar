// 'use strict';
// /* global before */
// /* global after */
// /*jshint -W079 */
// var expect = require('chai').expect;
//
// process.env.NODE_ENV = 'test';
// process.env.NODE_LOG_LEVEL = 'none';
// var app = require('../../app.js');
//
// var CalendarEvent = require('../../db-models/calendarEvent.js');
// var Calendar = require('../../db-models/calendar.js');
// var User = require('../../db-models/user.js');
//
// describe('Calendar Model', function () {
//
//   var testUser;
//
//   // delete users
//   before(function (done) {
//     User.remove({}).exec()
//       .then(function () {
//         done();
//       }, done);
//   });
//
//   // create user
//   before(function (done) {
//     var user = new User({
//       userName: 'testuser',
//       password: 'testuser',
//       email: 'testuser@test.com',
//       firstName: 'test',
//       lastName: 'user'
//     });
//
//     user.save()
//       .then(function (user) {
//         testUser = user;
//       })
//       .then(function () {
//         done();
//       }, done);
//   });
//
//   // clear calendars and events
//   beforeEach(function (done) {
//     CalendarEvent.remove({}).exec()
//       .then(function () {
//         return Calendar.remove({}).exec();
//       })
//       .then(function () {
//         done();
//       }, done);
//   });
//
//   it('should start with no calendar-events or calendars', function (done) {
//
//     Calendar.find()
//       .then(function (calendars) {
//         expect(calendars.length).to.equal(0);
//         return CalendarEvent.find();
//       })
//       .then(function (events) {
//         expect(events.length).to.equal(0);
//       })
//       .then(function () {
//         done();
//       }, done);
//   });
//
//   describe('Create', function () {
//
//     it('should create a new calendar if data is valid', function (done) {
//       var cal = new Calendar({
//         userId: testUser._id,
//         title: 'test calendar'
//       });
//
//       cal.save()
//         .then(function (calendar) {
//           expect(calendar).to.exist;
//           expect(calendar.config.showEvents).to.equal(true);
//         })
//         .then(function () {
//           done();
//         }, done);
//     });
//
//     it('should give validation error if userId is null', function (done) {
//       var cal = new Calendar({
//         title: 'test calendar'
//       });
//
//       cal.save()
//         .then(function (calendar) {
//           expect(calendar).to.not.exist;
//         }, function (err) {
//           expect(err).to.exist;
//           expect(err.errors).to.exist;
//           expect(err.errors['userId']).to.exist;
//           expect(err.errors['userId'].message).to.equal('Path `userId` is required.');
//         })
//         .then(function () {
//           done();
//         }, done);
//     });
//
//     it('should give validation error if title is null', function (done) {
//       var cal = new Calendar({
//         userId: testUser._id,
//       });
//
//       cal.save()
//         .then(function (calendar) {
//           expect(calendar).to.not.exist;
//         }, function (err) {
//           expect(err).to.exist;
//           expect(err.errors).to.exist;
//           expect(err.errors['title']).to.exist;
//           expect(err.errors['title'].message).to.equal('Path `title` is required.');
//         })
//         .then(function () {
//           done();
//         }, done);
//     });
//   });
//
//   describe('Update', function () {
//
//     // clear calendars and events
//     var testCalendar;
//
//     beforeEach(function (done) {
//       var cal = new Calendar({
//         userId: testUser._id,
//         title: 'test calendar'
//       });
//
//       cal.save()
//         .then(function (calendar) {
//           expect(calendar).to.exist;
//           testCalendar = calendar;
//         })
//         .then(function () {
//           done();
//         }, done);
//     });
//
//     it('should update a calendar if data is valid', function (done) {
//
//       expect(testCalendar).to.exist;
//
//       var newTitle = 'updated calendar';
//       var newShowEvents = false;
//
//       Calendar.findOneAndUpdate({
//           _id: testCalendar._id,
//           userId: testCalendar.userId
//         }, {
//           $set: {
//             title: newTitle,
//             'config.showEvents': newShowEvents
//           }
//         }, {
//           new: true,
//           runValidators: true
//         })
//         .then(function (calendar) {
//           expect(calendar.title).to.equal(newTitle);
//           expect(calendar.config.showEvents).to.equal(newShowEvents);
//         })
//         .then(function () {
//           done();
//         }, done);
//     });
//
//     it('should give validation error if userId is null', function (done) {
//       expect(testCalendar).to.exist;
//
//       Calendar.findOneAndUpdate({
//           _id: testCalendar._id,
//           userId: testCalendar.userId
//         }, {
//           $set: {
//             userId: null
//           }
//         }, {
//           new: true,
//           runValidators: true
//         })
//         .then(function (calendar) {
//           expect(calendar).to.not.exist;
//         }, function (err) {
//           expect(err).to.exist;
//           expect(err.errors).to.exist;
//           expect(err.errors['userId']).to.exist;
//           expect(err.errors['userId'].message).to.equal('Path `userId` is required.');
//         })
//         .then(function () {
//           done();
//         }, done);
//
//     });
//
//     it('should give validation error if title is null', function (done) {
//       expect(testCalendar).to.exist;
//
//       Calendar.findOneAndUpdate({
//           _id: testCalendar._id,
//           userId: testCalendar.userId
//         }, {
//           $set: {
//             title: null
//           }
//         }, {
//           new: true,
//           runValidators: true
//         })
//         .then(function (calendar) {
//           expect(calendar).to.not.exist;
//         }, function (err) {
//           expect(err).to.exist;
//           expect(err.errors).to.exist;
//           expect(err.errors['title']).to.exist;
//           expect(err.errors['title'].message).to.equal('Path `title` is required.');
//         })
//         .then(function () {
//           done();
//         }, done);
//
//     });
//   });
// });
