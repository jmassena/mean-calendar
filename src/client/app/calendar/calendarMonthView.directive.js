(function (angular) {
  'use strict';

  angular.module('app')
    .directive('calendarMonthView', calendarMonthView);

  calendarMonthView.$inject = ['$timeout', '$modal', 'UtilitySvc', 'CalendarEditSvc'];

  function calendarMonthView($timeout, $modal, UtilitySvc, CalendarEditSvc) {

    // renders the calendar name, color, dropdown arrow for setting properties
    // emits events to communicate with calendar controller for setting color or deactivating calendar.
    return {
      restrict: 'E',
      templateUrl: './app/calendar/calendarMonthView.templ.html',
      scope: {
        monthViewEvents: '=',
        calendarList: '='
      },

      controller: function ($scope) {

        $scope.openDetailsDialog = function ($event, calendarEvent) {

          $event.stopPropagation();

          var modalInstance = $modal.open({
            windowClass: 'modal fade in',
            size: 'sm',
            resolve: {
              calendarEvent: function () {
                return calendarEvent;
              }
            },
            scope: $scope,

            templateUrl: './app/calendar/modal-calendar-event-details.templ.html',

            controller: function ($scope, $modalInstance, calendarEvent) {

            }

          });

        };

        $scope.openCreateDialog = function ($event, dayDate, calendarEvent) {

          var modalInstance;
          if(calendarEvent) {
            modalInstance = CalendarEditSvc.openEditDialog(calendarEvent, $scope.calendarList);
          } else {
            modalInstance = CalendarEditSvc.openCreateDialog(dayDate, $scope.calendarList);
          }

          modalInstance.result.then(function (result) {

            if(!result) {
              return;
            }
            if(result.action === 'update') {
              $scope.$emit('calendarEvent.update', result.calendarId, result.calendarEvent);
            } else if(result.action === 'create') {
              $scope.$emit('calendarEvent.create', result.calendarId, result.calendarEvent);
            } else if(result.action === 'delete') {
              $scope.$emit('calendarEvent.delete', result.calendarId, result.calendarEvent
                ._id);
            }

          });

        };
      }

    };
  }

}(this.angular));
