(function (angular) {
  'use strict';

  angular.module('app')
    .factory('UtilitySvc', UtilitySvc);

  UtilitySvc.$inject = [];

  function UtilitySvc() {

    var lastShortId = 0;

    /*
      Returns a guid
    */
    function guid() {
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    /*
      Returns an integer from 0 to 99,999.
      Integers are assigned in order and repeat after 100,000 uses.
    */
    function shortId() {
      return ++lastShortId % 100000;
    }

    /*
      Helper function to generate parts of guid
    */
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    var _MS_PER_DAY = 1000 * 60 * 60 * 24;

    // a and b are javascript Date objects
    function dateDiffInDays(start, end) {
      // Discard the time and time-zone information.
      var utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      var utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

      return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    /*
      Returns the input date with the time components set to 0.
    */
    function startOfDate(d) {

      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    /*
      Returns the input date modified by the config years, months, days, hours, minutes, seconds, milliseconds.
      Does not modify input date.
    */
    function dateAdd(d, config) {
      /*jshint maxcomplexity:10*/
      var ret = new Date(d);

      if(config) {
        if(config.years) {
          ret.setYears(ret.getFullYear() + config.years);
        }
        if(config.months) {
          ret.setMonth(ret.getMonth() + config.months);
        }
        if(config.days) {
          ret.setDate(ret.getDate() + config.days);
        }
        if(config.hours) {
          ret.setHours(ret.getHours() + config.hours);
        }
        if(config.minutes) {
          ret.setMinutes(ret.getMinutes() + config.minutes);
        }
        if(config.seconds) {
          ret.setSeconds(ret.getSeconds() + config.seconds);
        }
        if(config.milliseconds) {
          ret.setMilliseconds(ret.getMilliseconds() + config.milliseconds);
        }
      }

      return ret;
    }

    var monthNames = [{
      full: 'January',
      abbreviated: 'Jan'
    }, {
      full: 'February',
      abbreviated: 'Feb'
    }, {
      full: 'March',
      abbreviated: 'Mar'
    }, {
      full: 'April',
      abbreviated: 'Apr'
    }, {
      full: 'May',
      abbreviated: 'May'
    }, {
      full: 'June',
      abbreviated: 'Jun'
    }, {
      full: 'July',
      abbreviated: 'Jul'
    }, {
      full: 'August',
      abbreviated: 'Aug'
    }, {
      full: 'September',
      abbreviated: 'Sep'
    }, {
      full: 'October',
      abbreviated: 'Oct'
    }, {
      full: 'November',
      abbreviated: 'Nov'
    }, {
      full: 'December',
      abbreviated: 'Dec'
    }];

    var dayNames = [{
      full: 'Sunday',
      abbreviated: 'Sun'
    }, {
      full: 'Monday',
      abbreviated: 'Mon'
    }, {
      full: 'Tuesday',
      abbreviated: 'Tues'
    }, {
      full: 'Wednesday',
      abbreviated: 'Wed'
    }, {
      full: 'Thursday',
      abbreviated: 'Thurs'
    }, {
      full: 'Friday',
      abbreviated: 'Fri'
    }, {
      full: 'Saturday',
      abbreviated: 'Sat'
    }];

    function getDayName(d) {
      return dayNames[d.getDay()];
    }

    function getMonthName(d) {
      return monthNames[d.getMonth()];
    }

    return {
      guid: guid,
      shortId: shortId,
      dateAdd: dateAdd,
      startOfDate: startOfDate,
      getDayName: getDayName,
      getMonthName: getMonthName,
      dateDiffInDays: dateDiffInDays
    };
  }

}(this.angular));
