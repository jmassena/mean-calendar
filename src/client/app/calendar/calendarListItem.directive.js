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

      controller: function ($scope) {
        $scope.deleteCalendar = function (calendar) {
          // give bootstrapcs a chance to close modal?

          $timeout(function () {
            $scope.$emit('mycalendar.delete', calendar._id);
          });
        };
      },

      link: function (scope, element, attrs) {

      }

    };
  }

}(this.angular));
