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
            scope: $scope,
            resolve: {
              calendarEvent: function () {
                return calendarEvent;
              }
            },

            templateUrl: './app/calendar/modal-calendar-event-details.templ.html',

            controller: function ($scope, $modalInstance, calendarEvent) {
              $scope.calendarEvent = calendarEvent;

              $scope.datesSummary = '';

              var start = calendarEvent.start;
              var end = calendarEvent.end;

              $scope.datesSummary = UtilitySvc.getMonthName(start).abbreviated + ' ' +
                start.getDate();

              if(UtilitySvc.startOfDate(start).getTime() === UtilitySvc.startOfDate(
                  end).getTime()) {

                if(!calendarEvent.allDay) {
                  $scope.datesSummary += ', ' + getTimeString(start);
                  $scope.datesSummary += ' - ' + getTimeString(end);
                }

              } else {

                if(!calendarEvent.allDay) {
                  $scope.datesSummary += ', ' + getTimeString(start);
                }

                $scope.datesSummary += ' - ' + UtilitySvc.getMonthName(end).abbreviated +
                  ' ' +
                  end.getDate();
                if(!calendarEvent.allDay) {
                  $scope.datesSummary += ', ' + getTimeString(end);
                }
              }

              function getTimeString(d) {
                var amPm = 'am';
                var hour = d.getHours();
                if(hour >= 12) {
                  amPm = 'pm';
                  if(hour > 13) {
                    hour -= 13;
                  }
                  if(hour === 0) {
                    hour = '12';
                  }
                }

                return hour + (d.getMinutes() > 0 ? ':' + d.getMinutes() : '') + amPm;
              }

              $scope.cancel = function () {
                $modalInstance.dismiss();
              };

              $scope.edit = function ($event, calendarEvent) {
                $modalInstance.dismiss();
                return openCreateDialog($event, null, calendarEvent);
              };

              $scope.delete = function (calendarEvent) {
                $scope.$emit('calendarEvent.delete', calendarEvent.calendarId,
                  calendarEvent._id);
                $modalInstance.dismiss();
              };
            }

          });

        };

        $scope.openCreateDialog = openCreateDialog;

        function openCreateDialog($event, dayDate, calendarEvent) {

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

        }
      }

    };
  }

}(this.angular));
