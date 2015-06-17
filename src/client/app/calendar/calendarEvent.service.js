(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('CalendarEventSvc', CalendarEventSvc);

  /*
   * service for getting calendar events data
   *
   */
  CalendarEventSvc.$inject = ['$q', '$http', '$timeout'];

  function CalendarEventSvc($q, $http, $timeout) {

    var calendarBaseUrl = '/api/calendars/';

    function deserializeEventDates(event) {
      event.start = new Date(event.start);
      event.end = new Date(event.end);
    }

    function getEventsList(calendarId, start, end) {
      return $http.get(eventUrl.list(calendarId, start, end))
        .then(function (res) {

          // convert date strings to date objects
          var data = res.data;
          if(data && data.length > 0) {
            for(var i = 0; i < data.length; i++) {
              deserializeEventDates(data[i]);
            }
          }
          return res;
        });
    }

    function createEvent(calendarId, calendarEvent) {
      return $http.post(eventUrl.insert(calendarId), calendarEvent);
    }

    function updateEvent(calendarId, calendarEvent) {
      return $http.put(eventUrl.update(calendarId, calendarEvent._id), calendarEvent);
    }

    function deleteEvent(calendarId, eventId) {
      return $http.delete(eventUrl.delete(calendarId, eventId));
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
      getEventsList: getEventsList,
      createEvent: createEvent,
      updateEvent: updateEvent,
      deleteEvent: deleteEvent
    };

  }
})(this.angular);
