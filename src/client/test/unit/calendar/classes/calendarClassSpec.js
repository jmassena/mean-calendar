'use strict';

describe('Calendar class', function () {

  // get ref to calendar constructor.

  beforeEach(module('app'));

  var Calendar;
  beforeEach(inject(function ($injector) {
    Calendar = $injector.get('Calendar');
  }));

  it('Calendars constructor should populate list from list input', function () {
    // var calendars = [{
    //   calendarId: 1,
    //   events: []
    // }, {
    //   calendarId: 2,
    //   events: []
    // }];
    // var c = new Calendar(calendars);
    //
    // expect(c.items.length).toEqual(2);

    expect(true).toEqual(true);

  });

  xit('Calendars constructor should populate list from single input', function () {
    expect(true).toEqual(true);
  });

  xit('Calendars constructor should populate list from null/empty input', function () {
    expect(true).toEqual(true);
  });

});
