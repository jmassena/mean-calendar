(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('CalendarEventsCache', CalendarEventsCacheFactory);

  function CalendarEventsCacheFactory() {

    function CalendarEventsCache() {
      this.calendars = [];
      this.ranges = [];
    }

    CalendarEventsCache.prototype.addCalendar = function (calendar) {

      this.calendars.push({
        calendarId: calendar._id,
        events: []
      });
    };

    CalendarEventsCache.prototype.deleteCalendar = function (calendar) {

      for(var i = 0; i < this.calendars.length; i++) {
        if(this.calendars[i].calendarId === calendar._id) {
          this.calendars.splice(i, 1);
          //this.eventsModifiedDate = new Date();
          return;
        }
      }
    };

    CalendarEventsCache.prototype.replaceEvent = function (event) {

      this.deleteEvent(event._id);
      this.addEvent(event);
    };

    CalendarEventsCache.prototype.deleteEvent = function (eventId) {

      for(var i = 0; i < this.calendars.length; i++) {
        var calendar = this.calendars[i];

        for(var j = 0; j < calendar.events.length; j++) {
          if(calendar.events[j]._id === eventId) {
            calendar.events.splice(j, 1);
            return;
          }
        }
      }
    };

    CalendarEventsCache.prototype.addEvent = function (event) {

      if(typeof event.start === 'string') {
        event.start = new Date(event.start);
      }
      if(typeof event.end === 'string') {
        event.end = new Date(event.end);
      }

      for(var i = 0; i < this.calendars.length; i++) {

        var calendar = this.calendars[i];

        if(calendar.calendarId === event.calendarId) {

          calendar.events.push(event);
          return;
        }
      }
    };

    return CalendarEventsCache;

  }
})(this.angular);
