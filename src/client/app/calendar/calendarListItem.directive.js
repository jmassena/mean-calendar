(function (angular) {
  'use strict';

  angular.module('app')
    .directive('calendarListItem', calendarListItem);

  calendarListItem.$inject = ['$timeout'];

  function calendarListItem($timeout) {

    // renders the calendar name, color, dropdown arrow for setting properties
    // emits events to communicate with calendar controller for setting color or deactivating calendar.
    return {
      restrict: 'E',
      templateUrl: './app/calendar/calendarListItem.templ.html',
      scope: {
        calendar: '='
      },

      link: function (scope, element, attrs) {

      }

    };
  }

}(this.angular));
