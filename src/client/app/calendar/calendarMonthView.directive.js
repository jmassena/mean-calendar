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
            // size: 'sm',
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
                // $scope.newEvent._id = calendarEvent._id;
                // $scope.newEvent.allDay = calendarEvent.allDay;
                // $scope.newEvent.start = calendarEvent.start;
                // $scope.newEvent.end = calendarEvent.end;
                // $scope.newEvent.title = calendarEvent.title;
                // $scope.newEvent.notes = calendarEvent.notes;
                angular.extend($scope.newEvent, calendarEvent);

              } else {
                // new event
                $scope.newEvent.calendar = null;
                $scope.newEvent.allDay = true;
                var d = dayDate ? new Date(dayDate) : new Date();
                $scope.newEvent.start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                $scope.newEvent.end = new Date($scope.newEvent.start);
              }

              $scope.form = {};

              $scope.submit = function () {
                if($scope.form.newEvent.$valid) {

                  // var calendarEvent = {};
                  // calendarEvent.title = $scope.newEvent.title;
                  // calendarEvent.notes = $scope.newEvent.notes;
                  // calendarEvent.allDay = $scope.newEvent.allDay;
                  // calendarEvent.start = $scope.newEvent.start;
                  // calendarEvent.end = $scope.newEvent.end;

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
