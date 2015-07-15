'use strict';

describe('Day class', function () {

  beforeEach(module('app'));

  var Day;
  var EventWrapper;
  var UtilitySvc;
  var testDay;
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  var yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() + 1);

  var testEvent1 = {
    calendarId: 1234,
    userId: 1234,
    start: yesterday,
    end: tomorrow,
    allDay: true,
    title: 'event 1'
  };

  var testEvent2 = {
    calendarId: 1234,
    userId: 1234,
    start: today,
    end: tomorrow,
    allDay: true,
    title: 'event 2'
  };

  beforeEach(inject(function ($injector) {
    Day = $injector.get('Day');
    EventWrapper = $injector.get('EventWrapper');
    UtilitySvc = $injector.get('UtilitySvc');

  }));

  beforeEach(function () {
    testDay = new Day(today);
    testDay.setFillerEventAt(0);
    testDay.setNextAvailableEvent(testEvent1);
    testDay.setNextAvailableEvent(testEvent2);
    testDay.setMoreEvents(1);
    testDay.setLastFillerEvent(1);
  });

  it('constructor should initialize day date', function () {
    expect(testDay.date).toEqual(today);
  });

  it('isToday should return true if day is today', function () {
    expect(testDay.isToday()).toEqual(true);
  });

  it('isToday should return false if day is not today', function () {
    testDay.date.setDate(tomorrow);
    expect(testDay.isToday()).toEqual(false);

    testDay.date.setDate(yesterday);
    expect(testDay.isToday()).toEqual(false);
  });

  it('getVisibleEvents should return non-filler/more-events events', function () {
    expect(testDay.getVisibleEvents().length).toEqual(2);
  });

  it('getNextAvailableEventIndex should return next empty event index', function () {
    testDay.events = [];
    testDay.setEvent(testEvent2, 0);
    testDay.setEvent(testEvent1, 2);
    expect(testDay.getNextAvailableEventIndex()).toEqual(1);
  });

  it('setNextAvailableEvent should set event to next empty event index', function () {
    testDay.events = [];
    testDay.setEvent(testEvent2, 0);
    testDay.setEvent(testEvent1, 2);
    testDay.setNextAvailableEvent({
      title: 'inserted event'
    });
    expect(testDay.events[1].title).toEqual('inserted event');
  });

  it('setMoreEvents should add a "more event" element to the end of events list', function () {
    testDay.events = [];
    testDay.setEvent(testEvent2, 0);
    testDay.setEvent(testEvent1, 2);
    testDay.setMoreEvents(2);
    expect(testDay.events[testDay.events.length - 1].moreEventsCount).toEqual(2);
  });

  it('setFillerEventAt should add a filler event at specified index', function () {
    testDay.events = [];
    testDay.setFillerEventAt(3);
    expect(testDay.events[3].fillerEvent).toEqual(true);
  });

  it('setLastFillerEvent should add a filler event at end of events list', function () {
    testDay.events = [];
    testDay.setFillerEventAt(3);
    testDay.setLastFillerEvent(5);
    expect(testDay.events[4].fillerEvent).toEqual(true);
    expect(testDay.events[4].lastEvent).toEqual(true);
    expect(testDay.events[4].rowSpan).toEqual(5);
    expect(testDay.events[4].date).toEqual(testDay.date);
  });

  it('setEvent should add a wrapped event at specified index', function () {
    testDay.events = [];
    testDay.setEvent(testEvent1, 2);
    expect(testDay.events[2] instanceof EventWrapper).toEqual(true);
  });

  it('dayName should return the name of the day', function () {
    expect(testDay.dayName()).toEqual(UtilitySvc.getDayName(testDay.date));
  });

  it('monthName should return the name of the day month', function () {
    expect(testDay.monthName()).toEqual(UtilitySvc.getMonthName(testDay.date));
  });

  xit('calendarDisplayDate should return formatted date', function () {
    testDay.date.setDate(1);
    var display = testDay.monthName().abbreviated + ' ' + testDay.date.getDate();
    expect(testDay.calendarDisplayDate()).toEqual(display);

    testDay.date.setDate(2);
    expect(testDay.calendarDisplayDate()).toEqual(testDay.date.getDate());
  });

});
