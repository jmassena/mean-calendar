// // src/server/test/e2e/todo.route.spec.js
// 'use strict';
//
// /* global before */
// /* global after */
// var Q = require('q');
// var mongoose = require('mongoose');
// var request = require('supertest');
// /*jshint -W079 */
// var expect = require('chai').expect;
// var path = require('path');
//
// // var testUtils = require('../../common/testUtils.js');
// // var userDAL = require('../../data-access/user.js');
// var auth = require('../../auth/auth.service.js');
//
// var CalendarEvent = require('../../db-models/calendarEvent.js');
// var Calendar = require('../../db-models/calendar.js');
// var User = require('../../db-models/user.js');
//
// process.env.NODE_ENV = 'test';
// process.env.NODE_LOG_LEVEL = 'none';
// var app = require('../../app.js');
//
// // var usersRootUri = '/api/users';
// var eventRootUri = '/api/calendars';
//
// var eventUrl = {
//   list: function (calendarId, start, end) {
//     var url = path.join(eventRootUri, calendarId.toString(), 'events');
//
//     if(start || end) {
//       var params = [];
//       if(start) {
//         params.push('start=' + start);
//       }
//       if(end) {
//         params.push('end=' + end);
//       }
//       url += '?' + params.join('&');
//     }
//     return url;
//   },
//   get: function (calendarId, eventId) {
//     return path.join(eventRootUri, calendarId.toString(), 'events', eventId.toString());
//   },
//   insert: function (calendarId) {
//     return path.join(eventRootUri, calendarId.toString(), 'events');
//   },
//   update: function (calendarId, eventId) {
//     return path.join(eventRootUri, calendarId.toString(), 'events', eventId.toString());
//   },
//   delete: function (calendarId, eventId) {
//     return path.join(eventRootUri, calendarId.toString(), 'events', eventId.toString());
//   }
// };
//
// describe('Calendar Event route', function () {
//
//   var testUser;
//   var token;
//   var testCalendar;
//
//   // delete users
//   before(function (done) {
//     User.remove({}).exec()
//       .then(function () {
//         done();
//       }, done);
//   });
//
//   // create user and token
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
//         token = auth.signToken(user._id);
//       })
//       .then(function () {
//         done();
//       }, done);
//   });
//
//   // delete calendars and events
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
//   // create calendar
//   beforeEach(function (done) {
//
//     new Calendar({
//         title: 'Test Calendar',
//         userId: testUser._id
//       })
//       .save()
//       .then(function (calendar) {
//         testCalendar = calendar;
//       })
//       .then(function () {
//         done();
//       }, done);
//   });
//
//   it('should start with no calendar-events and only the test calendar', function (done) {
//
//     Calendar.find()
//       .then(function (calendars) {
//         expect(testCalendar.id).to.exist;
//         expect(calendars.length).to.equal(1);
//         expect(calendars[0].id).to.equal(testCalendar.id);
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
//   describe('POST /calendars/:calendarId/events/', function () {
//     it('should create an event', function (done) {
//
//       var newEvent = {
//         title: 'test event',
//         notes: 'test notes',
//         label: 'test',
//         start: new Date('10/10/2015'),
//         end: new Date('10/10/2015'),
//         allDay: true
//       };
//
//       request(app)
//         .post(eventUrl.insert(testCalendar.id))
//         .set('Authorization', 'Bearer ' + token)
//         .send(newEvent)
//         .end(function (err, res) {
//           //console.log(res.body);
//           expect(res.status).to.equal(201);
//           expect(res.body._id).to.not.be.null;
//           expect(res.header.location).to.equal(eventUrl.get(testCalendar.id, res.body._id));
//
//           for(var key in newEvent) {
//             if(key === 'start' || key === 'end') {
//               expect(new Date(res.body[key])).to.equalDate(newEvent[key]);
//             } else {
//               expect(res.body[key]).to.equal(newEvent[key]);
//             }
//           }
//           done();
//         });
//     });
//
//     it('should return 422 error if validation fails', function (done) {
//
//       var newEvent = {
//         // title: 'test event',
//         notes: 'test notes',
//         label: 'test',
//         start: new Date('10/10/2015'),
//         end: new Date('10/10/2015'),
//         allDay: true
//       };
//
//       request(app)
//         .post(eventUrl.insert(testCalendar.id))
//         .set('Authorization', 'Bearer ' + token)
//         .send(newEvent)
//         .expect(422)
//         .end(function (err, res) {
//           expect(err).to.not.exist;
//           expect(res.status).to.equal(422);
//           done();
//         });
//     });
//   });
//
//   describe('Existing single', function () {
//
//     var testEvent;
//
//     beforeEach(function (done) {
//
//       var newEvent = {
//         title: 'test event',
//         notes: 'test notes',
//         label: 'test',
//         start: new Date('10/10/2015'),
//         end: new Date('10/10/2015'),
//         allDay: true
//       };
//
//       newEvent = new CalendarEvent(newEvent);
//       newEvent.calendarId = testCalendar.id;
//       newEvent.userId = testUser.id;
//
//       newEvent.save()
//         .then(function (event) {
//           if(!event) {
//             throw new Error('Event create failed');
//           }
//           testEvent = event;
//           //console.log('return event');
//           //console.log(event);
//           done();
//         })
//         .then(null, done);
//     });
//
//     describe('GET /calendars/:calendarId/events/:eventId', function () {
//
//       it('should get a single event', function (done) {
//         request(app)
//           .get(eventUrl.get(testEvent.calendarId, testEvent.id))
//           .set('Authorization', 'Bearer ' + token)
//           .send()
//           .end(function (err, res) {
//             expect(res.status).to.equal(200);
//             expect(err).to.not.exist;
//             expect(res).to.not.be.null;
//             expect(res.body._id).to.equal(testEvent._id.toString());
//             done();
//           });
//       });
//
//       it('should return 404 if calendar not found', function (done) {
//
//         var fakeEventId = '55774027b6d357d3265e5aaa';
//
//         request(app)
//           .get(eventUrl.get(testEvent.calendarId, fakeEventId))
//           .set('Authorization', 'Bearer ' + token)
//           .send()
//           .end(function (err, res) {
//             expect(res.status).to.equal(404);
//             done();
//           });
//       });
//     });
//
//     describe('DELETE /calendars/:calendarId/events/:eventId', function () {
//
//       it('should delete an event', function (done) {
//         request(app)
//           .delete(eventUrl.delete(testEvent.calendarId, testEvent.id))
//           .set('Authorization', 'Bearer ' + token)
//           .send()
//           .end(function (err, res) {
//             expect(res.status).to.equal(200);
//             request(app)
//               .get(eventUrl.get(testEvent.calendarId, testEvent.id))
//               .set('Authorization', 'Bearer ' + token)
//               .send()
//               .end(function (err, res) {
//                 expect(res.status).to.equal(404);
//                 done();
//               });
//           });
//       });
//
//       it('should return 404 if calendar not found', function (done) {
//
//         var fakeId = '55774027b6d357d3265e5aaa';
//
//         request(app)
//           .delete(eventUrl.delete(testEvent.calendarId, fakeId))
//           .set('Authorization', 'Bearer ' + token)
//           .send()
//           .end(function (err, res) {
//             expect(res.status).to.equal(404);
//             done();
//           });
//       });
//     });
//
//     describe('PUT /calendars/:calendarId/events/:eventId', function () {
//       it('should update an event', function (done) {
//
//         testEvent.title = 'updated title';
//         testEvent.notes = 'updated notes';
//         testEvent.label = 'updated';
//         testEvent.start = new Date('5/5/2015 13:00:00');
//         testEvent.end = new Date('5/5/2015 15:00:00');
//         testEvent.allDay = false;
//
//         request(app)
//           .put(eventUrl.update(testEvent.calendarId, testEvent.id))
//           .set('Authorization', 'Bearer ' + token)
//           .send(testEvent)
//           .end(function (err, res) {
//             expect(res.status).to.equal(200);
//
//             if(err) {
//               return done(err);
//             }
//             request(app)
//               .get(eventUrl.get(testEvent.calendarId, testEvent.id))
//               .set('Authorization', 'Bearer ' + token)
//               .send()
//               .end(function (err, res) {
//                 expect(res.status).to.equal(200);
//                 expect(res.body._id.toString()).to.equal(testEvent._id.toString());
//                 expect(res.body.title).to.equal(testEvent.title);
//                 expect(res.body.notes).to.equal(testEvent.notes);
//                 expect(res.body.label).to.equal(testEvent.label);
//                 expect(res.body.allDay).to.equal(testEvent.allDay);
//                 expect(new Date(res.body.start)).to.equalDate(testEvent.start);
//                 expect(new Date(res.body.end)).to.equalDate(testEvent.end);
//
//                 done();
//               });
//           });
//       });
//     });
//   });
//
//   describe('Existing multiple', function () {
//
//     var testEvents = [];
//
//     beforeEach(function (done) {
//
//       var newEvents = [];
//
//       // test range is 10/1/2015 - 11/1/2015
//       newEvents.push({
//         title: 'invalid event: ends before range starts',
//         start: new Date('09/10/2015'),
//         end: new Date('10/01/2015'),
//       });
//
//       newEvents.push({
//         title: 'invalid event: starts after range ends',
//         start: new Date('11/01/2015'),
//         end: new Date('11/01/2015'),
//       });
//
//       newEvents.push({
//         title: 'valid event: spans range start',
//         start: new Date('09/30/2015 23:59:59'),
//         end: new Date('10/01/2015 00:00:01'),
//       });
//
//       newEvents.push({
//         title: 'valid event: spans range end',
//         start: new Date('10/31/2015 23:59:59'),
//         end: new Date('11/01/2015 00:00:01'),
//       });
//
//       newEvents.push({
//         title: 'valid event: within range',
//         start: new Date('10/15/2015'),
//         end: new Date('10/16/2015'),
//       });
//
//       newEvents.push({
//         title: 'valid event: spans range',
//         start: new Date('09/30/2015 23:59:59'),
//         end: new Date('10/01/2015 00:00:01'),
//       });
//
//       var promises = [];
//
//       newEvents.forEach(function (item) {
//         var newEvent = new CalendarEvent(item);
//         newEvent.calendarId = testCalendar.id;
//         newEvent.userId = testUser.id;
//
//         promises.push(newEvent.save());
//       });
//
//       Q.all(promises)
//         .then(function (data) {
//           done();
//         })
//         .then(done, done);
//
//     });
//
//     describe('GET /calendars', function () {
//
//       it('should get all 6 calendar events', function (done) {
//
//         request(app)
//           .get(eventUrl.list(testCalendar.id))
//           .set('Authorization', 'Bearer ' + token)
//           .send()
//           .end(function (err, res) {
//             expect(res.status).to.equal(200);
//             expect(res.body.length).to.equal(6);
//             done();
//           });
//       });
//
//       it('should get 4 calendars within specified range', function (done) {
//
//         // test range is 10/1/2015 - 11/1/2015
//         var start = new Date('10/01/2015');
//         var end = new Date('11/01/2015');
//
//         request(app)
//           .get(eventUrl.list(testCalendar.id, start, end))
//           .set('Authorization', 'Bearer ' + token)
//           .end(function (err, res) {
//             expect(res.status).to.equal(200);
//             expect(res.body.length).to.equal(4);
//             done();
//           });
//       });
//
//       it('should get 1 calendar within specified range', function (done) {
//
//         var start = new Date('10/15/2015');
//         var end = new Date('10/16/2015');
//
//         request(app)
//           .get(eventUrl.list(testCalendar.id, start, end))
//           .set('Authorization', 'Bearer ' + token)
//           .end(function (err, res) {
//             expect(res.status).to.equal(200);
//             expect(res.body.length).to.equal(1);
//             done();
//           });
//       });
//     });
//   });
// });
