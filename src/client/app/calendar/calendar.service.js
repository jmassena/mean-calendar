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

    function deleteCalendar(calendarId) {
      return $http.delete(calendarUrl.delete(calendarId));
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

    return {
      getCalendarList: getCalendarList,
      createCalendar: createCalendar,
      updateCalendar: updateCalendar,
      deleteCalendar: deleteCalendar
    };

  }
})(this.angular);
