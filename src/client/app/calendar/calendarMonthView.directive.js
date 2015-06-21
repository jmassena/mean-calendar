(function (angular) {
  'use strict';

  angular.module('app')
    .directive('calendarMonthView', calendarMonthView);

  calendarMonthView.$inject = ['$timeout', '$modal'];

  function calendarMonthView($timeout, $modal) {

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

        $scope.openCreateDialog = function ($event, dayDate, calendarEvent) {

          $event.stopPropagation();

          var modalInstance = $modal.open({
            animation: true,
            size: 'sm',
            // resolve: {
            //   // calendarEvent: function () {
            //   //   return calendarEvent;
            //   // },
            //   calendarList: function () {
            //     return $scope.calendarList;
            //   }
            // },
            scope: $scope,

            templateUrl: './app/calendar/modal-new-calendar-event.templ.html',

            controller: function ($scope, $modalInstance) {

              $scope.newEvent = {};

              if(calendarEvent != null) {
                // edit event
                $scope.newEvent.forUpdate = true;

                var cal = $scope.calendarList.items.filter(function (item) {
                  return item._id === calendarEvent.calendarId;
                });

                $scope.newEvent.calendar = cal[0];
                angular.extend($scope.newEvent, calendarEvent);

                if($scope.newEvent.allDay) {
                  // set default start hour in case user wants to set time.
                  if($scope.newEvent.start.getTime() === $scope.newEvent.end.getTime()) {
                    $scope.newEvent.start.setHours(10);
                    $scope.newEvent.end.setHours(11);
                  } else {
                    $scope.newEvent.start.setHours(10);
                  }
                }

              } else {
                // new event
                $scope.newEvent.calendar = null;
                $scope.newEvent.allDay = true;
                var d = dayDate ? new Date(dayDate) : new Date();
                $scope.newEvent.start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10);
                $scope.newEvent.end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 11);
              }

              // // if user sets start date after end date then adjust end date to be same as start.
              // $scope.$watch(function () {
              //     return $scope.newEvent.start ? $scope.newEvent.start.getTime() : null;
              //     // return $scope.newEvent.notes;
              //   },
              //   function (newVal, oldVal) {
              //     if(newVal && $scope.newEvent.end && $scope.newEvent.start > $scope.newEvent.end) {
              //       $scope.newEvent.end = new Date($scope.newEvent.start);
              //
              //       // $scope.newEvent.end.setTime($scope.newEvent.start.getTime());
              //
              //       // // Grrrr, updateing model is not updating control it is bound to.
              //       // //test code
              //       // $scope.newEvent.start.setDate($scope.newEvent.start.getDate() - 5);
              //       // $scope.newEvent.start.setHours(23);
              //       //
              //       // $scope.newEvent.allDay = false;
              //       // $scope.newEvent.title = 'Test if scope updates go to control';
              //     }
              //   });

              // $scope.eventForm = {};

              $scope.submit = function () {
                if($scope.eventForm.$valid) {

                  if($scope.newEvent.allDay) {
                    $scope.newEvent.start.setHours(0);
                    $scope.newEvent.start.setMinutes(0);
                    $scope.newEvent.end.setHours(0);
                    $scope.newEvent.end.setMinutes(0);
                  }

                  if($scope.newEvent.forUpdate) {
                    $scope.$emit('calendarEvent.update', $scope.newEvent.calendar._id, $scope.newEvent);
                  } else {
                    $scope.$emit('calendarEvent.create', $scope.newEvent.calendar._id, $scope.newEvent);
                  }
                  $modalInstance.close();
                }
              };

              $scope.delete = function () {
                if($scope.newEvent.forUpdate) {
                  $scope.$emit('calendarEvent.delete', calendarEvent.calendarId, calendarEvent
                    ._id);
                }

                $modalInstance.close();
              };

              $scope.cancel = function () {
                $modalInstance.dismiss();
              };
            }
          });
        };

      }

    };
  }

}(this.angular));
