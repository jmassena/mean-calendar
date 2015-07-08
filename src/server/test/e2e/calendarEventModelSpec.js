'use strict';
/* global before */
/* global after */
/*jshint -W079 */
var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = chai.expect;

process.env.NODE_ENV = 'test';
process.env.NODE_LOG_LEVEL = 'none';
var app = require('../../app.js');

var CalendarEvent = require('../../db-models/calendarEvent.js');
var Calendar = require('../../db-models/calendar.js');
var User = require('../../db-models/user.js');

describe('CalendarEvent Model', function () {

  var testUser;
  var testCalendar;

  // delete users
  before(function (done) {
    User.remove({}).exec()
      .then(function () {
        done();
      }, done);
  });

  // create testUser
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
      })
      .then(function () {
        done();
      }, done);
  });

  // create testCalendar
  before(function (done) {
    var cal = new Calendar({
      userId: testUser._id,
      title: 'test calendar'
    });

    cal.save()
      .then(function (calendar) {
        testCalendar = calendar;
      })
      .then(function () {
        done();
      }, done);
  });

  // clear calendar events
  beforeEach(function (done) {
    CalendarEvent.remove({}).exec()
      .then(function () {
        done();
      }, done);
  });

  it('should start with no calendar-events', function (done) {

    CalendarEvent.find()
      .then(function (events) {
        expect(events.length).to.equal(0);
      })
      .then(function () {
        done();
      }, done);
  });

  describe('Create', function () {

    var testEvent;
    beforeEach(function () {
      testEvent = new CalendarEvent({
        calendarId: testCalendar._id,
        userId: testUser._id,
        start: '6/7/2015',
        end: '6/7/2015',
        allDay: true,
        title: 'test calendar event',
        notes: 'notes for test calendar event'
      });
    });

    it('should create a new calendar event', function (done) {

      testEvent.save()
        .then(function (event) {
          expect(event).to.exist;
          expect(event.title).to.equal(testEvent.title);
        })
        .then(function () {
          done();
        }, done);
    });

    it('should give validation error if start date is null', function (done) {

      testEvent.start = null;

      testEvent.save()
        .then(function (event) {
          expect(event).to.not.exist;
        }, function (err) {
          expect(err).to.exist;
          expect(err.errors).to.exist;
          expect(err.errors['start']).to.exist;
          expect(err.errors['start'].message).to.equal('Path `start` is required.');
        })
        .then(function () {
          done();
        }, done);
    });

    it('should give validation error if end date is null', function (done) {

      testEvent.end = null;

      testEvent.save()
        .then(function (event) {
          expect(event).to.not.exist;
        }, function (err) {
          expect(err).to.exist;
          expect(err.errors).to.exist;
          expect(err.errors['end']).to.exist;
          expect(err.errors['end'].message).to.equal('Path `end` is required.');
        })
        .then(function () {
          done();
        }, done);
    });

    it('should Not give validation error if end date is equal to start date', function (
      done) {

      var now = new Date();
      testEvent.start = now;
      testEvent.end = new Date(now);

      testEvent.start.setSeconds(30);
      testEvent.end.setSeconds(30);

      testEvent.save()
        .then(function (event) {
          expect(event).to.exist;
        }, function (err) {
          expect(err).to.not.exist;
        })
        .then(function () {
          done();
        }, done);
    });

    it('should give validation error if end date is less than start date', function (done) {

      var now = new Date();
      testEvent.start = now;
      testEvent.end = new Date(now);

      testEvent.start.setSeconds(30);
      testEvent.end.setSeconds(29);

      testEvent.save()
        .then(function (event) {
          expect(event).to.not.exist;
        }, function (err) {
          expect(err).to.exist;
          expect(err.errors).to.exist;
          expect(err.errors['end']).to.exist;
          expect(err.errors['end'].message).to.equal(
            'End date must be equal or greater than start date');
        })
        .then(function () {
          done();
        }, done);
    });

    it('should give validation error if title is null', function (done) {
      testEvent.title = null;

      testEvent.save()
        .then(function (event) {
          expect(event).to.not.exist;
        }, function (err) {
          expect(err).to.exist;
          expect(err.errors).to.exist;
          expect(err.errors['title']).to.exist;
          expect(err.errors['title'].message).to.equal('Path `title` is required.');
        })
        .then(function () {
          done();
        }, done);
    });

  });

  describe('Update', function (done) {

    expect(testEvent).to.not.exist;

    var testEvent;

    beforeEach(function (done) {
      new CalendarEvent({
          calendarId: testCalendar._id,
          userId: testUser._id,
          start: '6/7/2015',
          end: '6/7/2015',
          allDay: true,
          title: 'test calendar event',
          notes: 'notes for test calendar event'
        }).save()
        .then(function (event) {
          testEvent = event;
        }).then(function () {
          done();
        }, done);
    });

    it('should update an event if data is valid', function (done) {

      // expect(testEvent).to.exist;

      var newData = {
        start: new Date('06/22/2016'),
        end: new Date('06/25/2017'),
        allDay: false,
        title: 'updated calendar event',
        notes: 'notes for updated calendar event'
      };

      CalendarEvent.findOneAndUpdate({
          _id: testEvent._id,
          calendarId: testCalendar._id,
          userId: testUser._id
        }, {
          $set: {
            start: newData.start,
            end: newData.end,
            allDay: newData.allDay,
            title: newData.title,
            notes: newData.notes
          }
        }, {
          new: true,
          runValidators: true
        })
        .then(function (event) {
          expect(event).to.exist;
          expect(event.start).to.equalDate(newData.start);
          expect(event.end).to.equalDate(newData.end);
          expect(event.allDay).to.equal(newData.allDay);
          expect(event.title).to.equal(newData.title);
          expect(event.notes).to.equal(newData.notes);
        })
        .then(function () {
          done();
        }, done);
    });

    it('should give validation error if userId is null', function (done) {

      CalendarEvent.findOneAndUpdate({
          _id: testEvent._id,
          calendarId: testCalendar._id,
          userId: testUser._id
        }, {
          $set: {
            userId: null
          }
        }, {
          new: true,
          runValidators: true
        })
        .then(function (event) {
          expect(event).to.not.exist;
        }, function (err) {
          expect(err).to.exist;
          expect(err.errors).to.exist;
          expect(err.errors['userId']).to.exist;
          expect(err.errors['userId'].message).to.equal('Path `userId` is required.');
        })
        .then(function () {
          done();
        }, done);
    });

    // Testing validation on update is redundant since update and save use
    // same validation routines.

  });
});
