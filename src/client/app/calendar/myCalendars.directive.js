(function (angular) {
  'use strict';

  angular.module('app')
    .directive('myCalendars', myCalendars);

  myCalendars.$inject = ['$timeout'];

  function myCalendars($timeout) {

    // renders the calendar name, color, dropdown arrow for setting properties
    // emits events to communicate with calendar controller for setting color or deactivating calendar.
    return {
      restrict: 'E',
      templateUrl: './app/calendar/myCalendars.templ.html',
      scope: {
        calendarList: '='
      },

      link: function (scope, element, attrs) {

      }

    };
  }

}(this.angular));
