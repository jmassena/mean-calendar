(function (angular) {
  'use strict';

  angular.module('app')
    .directive('calendarMonthView', calendarMonthView);

  calendarMonthView.$inject = ['$timeout', '$modal', 'UtilitySvc'];

  function calendarMonthView($timeout, $modal, UtilitySvc) {

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

            templateUrl: './app/calendar/modal-calendar-event-edit.templ.html',

            controller: function ($scope, $modalInstance, UtilitySvc) {

              $scope.newEvent = {};

              if(calendarEvent != null) {
                // edit event
                $scope.newEvent.forUpdate = true;

                var cal = $scope.calendarList.items.filter(function (item) {
                  return item._id === calendarEvent.calendarId;
                });

                $scope.newEvent.calendar = cal[0];
                angular.extend($scope.newEvent, calendarEvent);

                if(!$scope.newEvent.allDay) {
                  $scope.newEvent.startTime = getTimeFromDate($scope.newEvent.start);
                  $scope.newEvent.endTime = getTimeFromDate($scope.newEvent.end);

                  $scope.newEvent.minEndTime = getMinimumEndTime($scope.newEvent.start,
                    $scope.newEvent.end,
                    $scope.newEvent.startTime);
                }

                // setToStartOfDate($scope.newEvent.start);
                // setToStartOfDate($scope.newEvent.end);
                $scope.newEvent.start = UtilitySvc.startOfDate($scope.newEvent.start);
                $scope.newEvent.end = UtilitySvc.startOfDate($scope.newEvent.end);

              } else {
                // new event
                $scope.newEvent.calendar = null;
                $scope.newEvent.allDay = true;
                var d = dayDate ? new Date(dayDate) : new Date();
                $scope.newEvent.start = UtilitySvc.startOfDate(d);
                $scope.newEvent.end = UtilitySvc.startOfDate(d);
              }

              $scope.newEvent.defaultStartTime = {
                hours: 10,
                minutes: 0
              };
              $scope.newEvent.defaultEndTime = {
                hours: 11,
                minutes: 0
              };

              // $scope.newEvent.start
              // if user sets start date after end date then adjust end date to be same as start.
              $scope.$watch(function () {
                  return $scope.newEvent.start ? $scope.newEvent.start.getTime() :
                    null;
                },
                function (newVal, oldVal) {
                  // move end date by same number of days.
                  if(newVal && newVal !== oldVal && $scope.newEvent.end) {
                    if($scope.newEvent.start > $scope.newEvent.end) {
                      $scope.newEvent.end = new Date($scope.newEvent.start);

                    }
                    $scope.newEvent.minEndTime = getMinimumEndTime($scope.newEvent.start,
                      $scope.newEvent.end, $scope.newEvent.startTime);
                  }
                });

              // $scope.newEvent.startTime
              $scope.$watch(function () {
                  return $scope.newEvent.startTime ? $scope.newEvent.startTime.hours +
                    ':' + $scope.newEvent.startTime.minutes : null;
                },
                function (newVal, oldVal) {
                  if(newVal && newVal !== oldVal) {
                    if(oldVal && $scope.newEvent.endTime) {
                      // move end time same distance that start time moved
                      var newTime = getTimeFromTimeString(newVal);
                      var oldTime = getTimeFromTimeString(oldVal);

                      var hoursDiff = (newTime.hours - oldTime.hours);
                      var daysDiff = (newTime.minutes - oldTime.minutes);
                      $scope.newEvent.endTime.hours += hoursDiff;
                      $scope.newEvent.endTime.minutes += daysDiff;

                      if($scope.newEvent.endTime.minutes > 59) {
                        $scope.newEvent.endTime.minutes %= 60;
                        $scope.newEvent.endTime.hours++;
                      } else if($scope.newEvent.endTime.minutes < 0) {
                        $scope.newEvent.endTime.minutes %= 60;
                        // to get positive number from negative mod result
                        $scope.newEvent.endTime.minutes += 60;
                        $scope.newEvent.endTime.hours--;
                      }

                      if($scope.newEvent.endTime.hours > 23) {
                        $scope.newEvent.endTime.hours %= 24;
                        // $scope.newEvent.end = dateAdd($scope.newEvent.end, 1);
                        $scope.newEvent.end = UtilitySvc.dateAdd($scope.newEvent.end, {
                          days: 1
                        });
                      } else if($scope.newEvent.endTime.hours < 0) {
                        $scope.newEvent.endTime.hours %= 24;
                        // to get positive number from negative mod result
                        $scope.newEvent.endTime.hours += 24;
                        // $scope.newEvent.end = dateAdd($scope.newEvent.end, -1);
                        $scope.newEvent.end = UtilitySvc.dateAdd($scope.newEvent.end, {
                          days: -1
                        });
                      }
                    }

                    $scope.newEvent.minEndTime = getMinimumEndTime($scope.newEvent.start,
                      $scope.newEvent.end, $scope.newEvent.startTime);
                  }
                });

              // $scope.eventForm = {};

              $scope.submit = function () {
                if($scope.eventForm.$valid) {

                  if(!$scope.newEvent.allDay) {

                    // $scope.newEvent.start.setHours($scope.newEvent.startTime.hours);
                    // $scope.newEvent.start.setMinutes($scope.newEvent.startTime.minutes);
                    // $scope.newEvent.end.setHours($scope.newEvent.endTime.hours);
                    // $scope.newEvent.end.setMinutes($scope.newEvent.endTime.minutes);
                    $scope.newEvent.start = UtilitySvc.startOfDate($scope.newEvent.start);
                    $scope.newEvent.end = UtilitySvc.startOfDate($scope.newEvent.end);

                  }

                  if($scope.newEvent.forUpdate) {
                    $scope.$emit('calendarEvent.update', $scope.newEvent.calendar._id,
                      $scope.newEvent);
                  } else {
                    $scope.$emit('calendarEvent.create', $scope.newEvent.calendar._id,
                      $scope.newEvent);
                  }
                  $modalInstance.close();
                }
              };

              $scope.delete = function () {
                if($scope.newEvent.forUpdate) {
                  $scope.$emit('calendarEvent.delete', calendarEvent.calendarId,
                    calendarEvent
                    ._id);
                }

                $modalInstance.close();
              };

              $scope.cancel = function () {
                $modalInstance.dismiss();
              };

              function getTimeFromTimeString(s) {
                var parsed = s.split(':');
                return {
                  hours: Number(parsed[0]),
                  minutes: Number(parsed[1])
                };
              }

              function getTimeFromDate(dt) {
                if(!dt) {
                  return null;
                }
                return {
                  hours: dt.getHours(),
                  minutes: dt.getMinutes()
                };
              }

              function getMinimumEndTime(startDate, endDate, startTime) {

                if(startDate.getTime() === endDate.getTime()) {
                  return angular.copy(startTime);
                }

                return null;
              }
            }
          });
        };

      }

    };
  }

}(this.angular));
