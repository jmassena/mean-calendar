'use strict';

describe('Week class', function () {

  beforeEach(module('app'));

  var Day;
  var Week;
  var testWeek;

  beforeEach(inject(function ($injector) {
    Day = $injector.get('Day');
    Week = $injector.get('Week');

  }));

  beforeEach(function () {
    testWeek = new Week();
    var dt = new Date();
    dt.setHours(0, 0, 0, 0);

    for(var i = 0; i < 7; i++) {
      testWeek.days.push(new Day(dt));
      dt.setDate(dt.getDate() + 1);
    }

    testWeek.days[0].setEvent({}, 0);
    testWeek.days[1].setEvent({}, 1);
    testWeek.days[2].setEvent({}, 2);
    testWeek.days[3].setEvent({}, 1);
    testWeek.days[4].setEvent({}, 2);
    testWeek.days[5].setEvent({}, 2);
    testWeek.days[6].setEvent({}, 0);
  });

  it(
    'eventsAtIndex should return all events for week at specified index except intra-week-continuations',
    function () {
      expect(testWeek.eventsAtIndex(2).length).toEqual(3);
      expect(testWeek.eventsAtIndex(0).length).toEqual(2);
      expect(testWeek.eventsAtIndex(5).length).toEqual(0);
    });

});
