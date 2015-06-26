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

    return {
      guid: guid,
      shortId: shortId,
      dateAdd: dateAdd,
      startOfDate: startOfDate
    };
  }

}(this.angular));
