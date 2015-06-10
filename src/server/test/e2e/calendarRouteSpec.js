// src/server/test/e2e/todo.route.spec.js
'use strict';

/* global before */
/* global after */

var mongoose = require('mongoose');
var request = require('supertest');
/*jshint -W079 */
var expect = require('chai').expect;
var path = require('path');

// var testUtils = require('../../common/testUtils.js');
// var userDAL = require('../../data-access/user.js');
var auth = require('../../auth/auth.service.js');

var CalendarEvent = require('../../db-models/calendarEvent.js');
var Calendar = require('../../db-models/calendar.js');
var User = require('../../db-models/user.js');

process.env.NODE_ENV = 'test';
process.env.NODE_LOG_LEVEL = 'none';
var app = require('../../app.js');

// var usersRootUri = '/api/users';
var calendarRootUri = '/api/calendars';

var calendarUrl = {
  list: function () {
    return calendarRootUri;
  },
  get: function (calendarId) {
    return path.join(calendarRootUri, calendarId);
  },
  insert: function () {
    return path.join(calendarRootUri);
  },
  update: function (calendarId) {
    return path.join(calendarRootUri, calendarId);
  },
  delete: function (calendarId) {
    return path.join(calendarRootUri, calendarId);
  }
};

describe('Calendar route', function () {

  var testUser;
  var token;

  // delete users
  before(function (done) {
    User.remove({}).exec()
      .then(function () {
        done();
      }, done);
  });

  // create user and token
  before(function (done) {
    var user = new User({
      userName: 'testuser',
      password: 'testuser',
      email: 'testuser@test.com',
      firstName: 'test',
      lastName: 'user'
    });

    user.save()
      .then(function (user) {
        testUser = user;
        token = auth.signToken(user._id);
      })
      .then(function () {
        done();
      }, done);
  });

  // delete calendars and events
  beforeEach(function (done) {
    CalendarEvent.remove({}).exec()
      .then(function () {
        return Calendar.remove({}).exec();
      })
      .then(function () {
        done();
      }, done);
  });

  // after(function (done) {
  //   console.log('closing connection');
  //   testUtils.closeConnection(mongoose, done);
  // });

  it('should start with no calendar-events or calendars', function (done) {

    Calendar.find()
      .then(function (calendars) {
        expect(calendars.length).to.equal(0);
        return CalendarEvent.find();
      })
      .then(function (events) {
        expect(events.length).to.equal(0);
      })
      .then(function () {
        done();
      }, done);
  });

  describe('POST /calendars', function () {
    it('should create a calendar', function (done) {

      var newCalendar = {
        title: 'test calendar'
      };

      request(app)
        .post(calendarUrl.insert())
        .set('Authorization', 'Bearer ' + token)
        .send(newCalendar)
        // .expect(201)
        .end(function (err, res) {
          expect(err).to.not.exist;
          expect(res.status).to.equal(201);
          expect(res.header.location).to.equal(path.join(calendarRootUri, res.body._id));
          expect(res.body.title).to.equal(newCalendar.title);
          expect(res.body._id).to.not.be.null;
          done();
        });
    });

    it('should return 422 error if no title', function (done) {
      request(app)
        .post(calendarUrl.insert())
        .set('Authorization', 'Bearer ' + token)
        .send()
        .expect(422)
        .end(function (err, res) {
          expect(err).to.not.exist;
          expect(res.status).to.equal(422);
          done();
        });
    });
  });

  describe('GET /calendars', function () {

    beforeEach(function (done) {

      request(app)
        .post(calendarUrl.insert())
        .set('Authorization', 'Bearer ' + token)
        .send({
          title: 'test calendar #1'
        })
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          done();
        });
    });

    beforeEach(function (done) {

      request(app)
        .post(calendarUrl.insert())
        .set('Authorization', 'Bearer ' + token)
        .send({
          title: 'test calendar #2'
        })
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          done();
        });
    });

    it('should get list of calendars', function (done) {

      request(app)
        .get(calendarUrl.list())
        .set('Authorization', 'Bearer ' + token)
        .end(function (err, res) {
          expect(res.status).to.equal(200);
          expect(res.body.length).to.equal(2);
          done();
        });
    });
  });

  describe('Existing', function () {

    var testCalendar;
    beforeEach(function (done) {

      request(app)
        .post(calendarUrl.insert())
        .set('Authorization', 'Bearer ' + token)
        .send({
          title: 'test calendar #1'
        })
        .end(function (err, res) {
          expect(res.status).to.equal(201);
          testCalendar = res.body;
          console.log(testCalendar);
          done();
        });
    });

    describe('GET /calendar/:calendarId', function () {
      it('should get a single calendar', function (done) {
        request(app)
          .get(calendarUrl.get(testCalendar._id))
          .set('Authorization', 'Bearer ' + token)
          .send()
          .end(function (err, res) {
            expect(res.status).to.equal(200);
            expect(err).to.not.exist;
            expect(res).to.not.be.null;
            expect(res.body._id).to.equal(testCalendar._id.toString());
            done();
          });
      });

      it('should return 404 if calendar not found', function (done) {

        var fakeCalendarId = '55774027b6d357d3265e5aaa';

        request(app)
          .get(calendarUrl.get(fakeCalendarId))
          .set('Authorization', 'Bearer ' + token)
          .send()
          .end(function (err, res) {
            expect(res.status).to.equal(404);
            done();
          });
      });

    });

    describe('DELETE /calendars/:calendarId', function () {
      it('should delete a calendars', function (done) {
        request(app)
          .delete(calendarUrl.delete(testCalendar._id))
          .set('Authorization', 'Bearer ' + token)
          .send()
          .end(function (err, res) {
            expect(res.status).to.equal(200);

            request(app)
              .get(calendarUrl.list())
              .set('Authorization', 'Bearer ' + token)
              .send()
              .end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body.length).to.equal(0);
                done();
              });
          });
      });

      it('should return 404 if calendar not found', function (done) {

        var fakeCalendarId = '55774027b6d357d3265e5aaa';

        request(app)
          .delete(calendarUrl.delete(fakeCalendarId))
          .set('Authorization', 'Bearer ' + token)
          .send()
          .end(function (err, res) {
            expect(res.status).to.equal(404);
            done();
          });
      });
    });

    describe('PUT /calendars/:calendarId', function () {
      it('should update a calendar', function (done) {

        testCalendar.title = 'updated title';
        testCalendar.config.showEvents = false;
        testCalendar.config.eventColor = '#ccccee';

        request(app)
          .put(calendarUrl.update(testCalendar._id))
          .set('Authorization', 'Bearer ' + token)
          .send(testCalendar)
          .end(function (err, res) {
            expect(res.status).to.equal(200);

            if(err) {
              return done(err);
            }
            request(app)
              .get(calendarUrl.get(testCalendar._id))
              .set('Authorization', 'Bearer ' + token)
              .send()
              .end(function (err, res) {
                expect(res.status).to.equal(200);
                expect(res.body._id.toString()).to.equal(testCalendar._id.toString());
                expect(res.body.title).to.equal(testCalendar.title);
                expect(res.body.config).to.exist;
                expect(res.body.config.showEvents).to.equal(testCalendar.config.showEvents);
                expect(res.body.config.eventColor).to.equal(testCalendar.config.eventColor);

                done();
              });
          });
      });
    });
  });

});
