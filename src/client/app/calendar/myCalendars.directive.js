(function (angular) {
  'use strict';

  angular.module('app')
    .directive('myCalendars', myCalendars);

  myCalendars.$inject = ['$timeout', '$document'];

  function myCalendars($timeout, $document) {

    // renders the calendar name, color, dropdown arrow for setting properties
    // emits events to communicate with calendar controller for setting color or deactivating calendar.
    return {
      restrict: 'E',
      templateUrl: './app/calendar/myCalendars.templ.html',
      scope: {
        calendarList: '='
      },

      controller: function ($scope) {
        $scope.createCalendar = function () {
          $scope.$emit('mycalendar.create', $scope.calendarList.newCalendarTitle);
          $scope.clearCreateCalendarForm();
        };

        $scope.clearCreateCalendarForm = function () {
          $scope.calendarList.newCalendarTitle = null;
          $scope.calendarList.showCreateDialog = false;
        };
      },

      link: function (scope, element, attrs) {

        function documentClickHandler(event) {
          var dialog = element.find('.my-calendars-create-dialog');
          if(event.target === dialog[0] || dialog.find(event.target).length > 0) {
            return;
          } else {
            $document.off('click', '*', documentClickHandler);
            element.find('#btnCancelCreateCalendar').click();
          }
        }

        scope.$watch(function () {
            return scope.calendarList.showCreateDialog;
          },
          function (newVal, oldVal) {
            if(newVal) {
              $timeout(function () {
                $document.on('click', '*', documentClickHandler);
              });
            }
          });
      }
    };
  }

  function documentClickHandler(e, element, $document) {

  }

}(this.angular));
