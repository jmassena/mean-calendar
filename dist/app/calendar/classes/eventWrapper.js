(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('EventWrapper', EventWrapperFactory);

  EventWrapperFactory.$inject = ['UtilitySvc'];

  function EventWrapperFactory(UtilitySvc) {

    function EventWrapper(calendarEvent) {

      angular.extend(this, calendarEvent);
    }

    EventWrapper.prototype.getBackgroundColor = function () {
      if(this.isAllDayOrMultiDay()) {
        return this.color || this.calendar.color;
      } else {
        return undefined;
      }
    };

    EventWrapper.prototype.getFontColor = function () {
      if(this.isAllDayOrMultiDay()) {
        return undefined;
      } else {
        return this.color || this.calendar.color;
      }
    };

    EventWrapper.prototype.isAllDayOrMultiDay = function () {
      return this.allDay || this.getDurationDays() > 0;
    };

    EventWrapper.prototype.getDurationDays = function () {
      return UtilitySvc.dateDiffInDays(this.start, this.end);
    };

    EventWrapper.prototype.startTimeString = function () {
      return this.timeString(this.start);
    };

    EventWrapper.prototype.endTimeString = function () {
      return this.timeString(this.end);
    };

    EventWrapper.prototype.timeString = function (d) {
      return this.getTimeString(d, true);
    };

    EventWrapper.prototype.getCompleteTimeString = function (d) {
      return this.getTimeString(d, false);
    };

    EventWrapper.prototype.getTimeString = function (d, shortAmPm) {
      if(!d) {
        return '';
      }

      var amPm = shortAmPm ? 'a' : 'am';
      var hour = d.getHours();
      if(hour >= 12) {
        amPm = shortAmPm ? 'p' : 'pm';
        if(hour > 12) {
          hour -= 12;
        }
        if(hour === 0) {
          hour = '12';
        }
      }

      return hour + (d.getMinutes() > 0 ? ':' + d.getMinutes() : '') + amPm;
    };

    EventWrapper.prototype.displayString = function () {
      if(this.allDay) {
        return this.title;
      }
      return this.startTimeString() + ' ' + this.title;
    };

    EventWrapper.prototype.getDateRangeSummary = function () {

      var datesSummary = UtilitySvc.getMonthName(this.start).abbreviated + ' ' + this.start.getDate();

      if(UtilitySvc.startOfDate(this.start).getTime() === UtilitySvc.startOfDate(this.end).getTime()) {

        if(!this.allDay) {
          datesSummary += ', ' + this.getCompleteTimeString(this.start);
          datesSummary += ' - ' + this.getCompleteTimeString(this.end);
        }

      } else {

        if(!this.allDay) {
          datesSummary += ', ' + this.getCompleteTimeString(this.start);
        }

        datesSummary += ' - ' + UtilitySvc.getMonthName(this.end).abbreviated + ' ' + this.end.getDate();
        if(!this.allDay) {
          datesSummary += ', ' + this.getCompleteTimeString(this.end);
        }
      }

      return datesSummary;
    };

    return EventWrapper;

  }
})(this.angular);
