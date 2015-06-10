(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('CalendarSvc', CalendarSvc);

  /*
   * service for getting calendar data
   *
   */
  CalendarSvc.$inject = ['$q', '$http', '$timeout'];

  function CalendarSvc($q, $http, $timeout) {

    var calendarBaseUrl = '/api/calendars/';

    function getCalendarList() {
      console.log('calling: ' + calendarUrl.list());

      return $http.get(calendarUrl.list());
    }

    function createCalendar(title) {
      console.log('calling: ' + calendarUrl.insert());
      return $http.post(calendarUrl.insert(), {
        title: title
      });
    }

    function updateCalendar(calendar) {
      return $http.put(calendarUrl.update(calendar._id), calendar);
    }

    var calendarUrl = {
      list: function () {
        return calendarBaseUrl;
      },
      getOne: function (calendarId) {
        return createCalendarUrl(calendarId);
      },
      insert: function () {
        return calendarBaseUrl;
      },
      update: function (calendarId) {
        return createCalendarUrl(calendarId);
      },
      delete: function (calendarId) {
        return createCalendarUrl(calendarId);
      }
    };

    function createCalendarUrl(calendarId) {
      if(calendarId) {
        return calendarBaseUrl + calendarId.toString();
      }
      return calendarBaseUrl;
    }

    var eventUrl = {
      list: function (calendarId, start, end) {
        var url = createEventUrl(calendarId);

        if(start || end) {
          var params = [];
          if(start) {
            params.push('start=' + start);
          }
          if(end) {
            params.push('end=' + end);
          }
          url = url + '?' + params.join('&');
        }
        return url;
      },
      getOne: function (calendarId, eventId) {
        return createEventUrl(calendarId, eventId);
      },
      insert: function (calendarId) {
        return createEventUrl(calendarId);
      },
      update: function (calendarId, eventId) {
        return createEventUrl(calendarId, eventId);
      },
      delete: function (calendarId, eventId) {
        return createEventUrl(calendarId, eventId);
      }
    };

    function createEventUrl(calendarId, eventId) {
      var url = calendarBaseUrl + calendarId.toString() + '/events';
      if(eventId) {
        url = url + '/' + eventId.toString();
      }
      return url;
    }

    return {
      getCalendarList: getCalendarList,
      createCalendar: createCalendar,
      updateCalendar: updateCalendar
    };

  }
})(this.angular);
