(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('Day', DayFactory);

  DayFactory.$inject = ['UtilitySvc', 'EventWrapper'];

  function DayFactory(UtilitySvc, EventWrapper) {

    function Day(d) {
      this.date = new Date(d);
      this.events = [];
    }

    Day.prototype.isToday = function () {

      return this.date.toDateString() === new Date().toDateString();
    };

    Day.prototype.getVisibleEvents = function () {

      var ret = this.events.filter(function (event) {
        return !event.fillerEvent && !event.moreEventsCount;
      });

      return ret;
    };

    Day.prototype.getNextAvailableEventIndex = function () {
      for(var i = 0; i < this.events.length; i++) {
        if(!this.events[i]) {
          return i;
        }
      }

      return this.events.length;
    };

    Day.prototype.setNextAvailableEvent = function (calendarEvent) {

      var idx = this.getNextAvailableEventIndex();
      return this.setEvent(calendarEvent, idx);
    };

    Day.prototype.setMoreEvents = function (moreEventsCount) {

      this.events.push({
        moreEventsCount: moreEventsCount,
        date: this.date,
        isForToday: this.isToday()
      });
    };

    Day.prototype.setFillerEventAt = function (idx) {

      this.events[idx] = {
        fillerEvent: true,
        date: this.date,
        isForToday: this.isToday()
      };
    };

    Day.prototype.setLastFillerEvent = function (rowSpan) {

      this.events.push({
        fillerEvent: true,
        lastEvent: true,
        rowSpan: rowSpan,
        date: this.date,
        isForToday: this.isToday()
      });
    };

    Day.prototype.setEvent = function (calendarEvent, idx) {

      var wrappedEvent = new EventWrapper(calendarEvent);
      wrappedEvent.index = idx;
      wrappedEvent.isForToday = this.isToday();

      this.events[idx] = wrappedEvent;
      return wrappedEvent;
    };

    Day.prototype.dayName = function () {
      // return this.dayNames[this.date.getDate()];
      return UtilitySvc.getDayName(this.date);

    };

    Day.prototype.monthName = function () {
      // return this.monthNames[this.date.getMonth()];
      return UtilitySvc.getMonthName(this.date);
    };

    Day.prototype.calendarDisplayDate = function () {
      var x = this.date.getDate() === 1 ?
        this.monthName().abbreviated + ' ' + this.date.getDate() :
        this.date.getDate();

      return x;
    };

    return Day;

  }
})(this.angular);
