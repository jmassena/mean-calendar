(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('Week', WeekFactory);

  function WeekFactory() {

    function Week() {
      this.days = [];
    }

    Week.prototype.eventsAtIndex = function (idx) {
      var ret = [];

      this.days.forEach(function (day) {
        if(day.events[idx] && !day.events[idx].isIntraWeekContinuation) {
          ret.push(day.events[idx]);
        }
      });

      return ret;
    };

    return Week;

  }
})(this.angular);
