'use strict';

describe('Calendar class', function () {

  beforeEach(module('app'));

  var Calendars;
  beforeEach(inject(function ($injector) {
    Calendars = $injector.get('Calendars');
  }));

  it('Calendars constructor should populate list from list input', function () {
    var calendars = [{
      userId: 1234,
      title: 'Birthdays',
      showEvents: true,
      color: '#9a9caa',
      isDefault: false
    }, {
      userId: 1234,
      title: 'General',
      showEvents: true,
      color: '#9a9cff',
      isDefault: true
    }];

    var c = new Calendars(calendars);

    expect(c.items.length).toEqual(2);
    expect(c.items[0].title).toEqual('General');
  });

  it('Calendars constructor should populate list from single input', function () {
    var c = new Calendars({
      userId: 1234,
      title: 'Birthdays',
      showEvents: true,
      color: '#9a9caa',
      isDefault: false
    });
    expect(c.items.length).toEqual(1);
  });

  it('Calendars constructor should populate list from null/empty input', function () {
    var c = new Calendars();
    expect(c.items.length).toEqual(0);
  });

});
