(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('CalendarEditSvc', CalendarEditSvc);

  /*
   * service for getting calendar data
   *
   */
  CalendarEditSvc.$inject = ['$q', '$modal', '$http', '$timeout', 'UtilitySvc'];

  function CalendarEditSvc($q, $modal, $http, $timeout, UtilitySvc) {

    return {
      openEditDialog: openEditDialog,
      openCreateDialog: openCreateDialog
    };

    function openCreateDialog(dayDate, calendarList) {
      return openDialog(dayDate, null, calendarList, false);
    }

    function openEditDialog(calendarEvent, calendarList) {
      return openDialog(null, calendarEvent, calendarList, true);
    }

    function openDialog(dayDate, calendarEvent, calendarList, forEdit) {

      var modalInstance = $modal.open({
        windowClass: 'modal fade in',
        // size: 'md',
        resolve: {
          config: function () {
            return {
              dayDate: dayDate,
              calendarEvent: calendarEvent,
              calendarList: calendarList,
              forEdit: forEdit
            };
          }
        },
        templateUrl: './app/calendar/modal-calendar-event-edit.templ.html',

        controller: ModalCtrl
      });

      return modalInstance;
    }

    ModalCtrl.$inject = ['$scope', '$modalInstance', 'UtilitySvc'];

    function ModalCtrl($scope, $modalInstance, UtilitySvc, config) {

      $scope.calendarList = config.calendarList;

      $scope.newEvent = {};
      $scope.newEvent.forUpdate = config.forEdit;

      $scope.modal = {
        title: config.forEdit ? 'Edit Event' : 'Create Event'
      };

      if($scope.newEvent.forUpdate) {

        // var cal = $scope.calendarList.items.filter(function (item) {
        //   return item._id === config.calendarEvent.calendarId;
        // });
        //
        // $scope.newEvent.calendar = cal[0];
        angular.extend($scope.newEvent, config.calendarEvent);

        if(!$scope.newEvent.allDay) {
          $scope.newEvent.startTime = getTimeFromDate($scope.newEvent.start);
          $scope.newEvent.endTime = getTimeFromDate($scope.newEvent.end);

          $scope.newEvent.minEndTime = getMinimumEndTime($scope.newEvent.start,
            $scope.newEvent.end,
            $scope.newEvent.startTime);
        }

        $scope.newEvent.start = UtilitySvc.startOfDate($scope.newEvent.start);
        $scope.newEvent.end = UtilitySvc.startOfDate($scope.newEvent.end);

      } else {
        // new event

        for(var i = 0; i < $scope.calendarList.items.length; i++) {
          // find first calendar showing events.
          if($scope.calendarList.items[i].showEvents) {
            $scope.newEvent.calendarId = $scope.calendarList.items[i]._id;
            break;
          }
        }

        $scope.newEvent.allDay = true;
        var d = config.dayDate ? new Date(config.dayDate) : new Date();
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
            $scope.newEvent.minEndTime = getMinimumEndTime($scope.newEvent
              .start,
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
                $scope.newEvent.end = UtilitySvc.dateAdd($scope.newEvent.end, {
                  days: 1
                });
              } else if($scope.newEvent.endTime.hours < 0) {
                $scope.newEvent.endTime.hours %= 24;
                // to get positive number from negative mod result
                $scope.newEvent.endTime.hours += 24;
                $scope.newEvent.end = UtilitySvc.dateAdd($scope.newEvent.end, {
                  days: -1
                });
              }
            }

            $scope.newEvent.minEndTime = getMinimumEndTime($scope.newEvent.start, $scope.newEvent
              .end, $scope.newEvent.startTime);
          }
        });

      $scope.submit = function () {
        if($scope.eventForm.$valid) {

          if(!$scope.newEvent.allDay) {
            $scope.newEvent.start.setHours($scope.newEvent.startTime.hours);
            $scope.newEvent.start.setMinutes($scope.newEvent.startTime.minutes);

            $scope.newEvent.end.setHours($scope.newEvent.endTime.hours);
            $scope.newEvent.end.setMinutes($scope.newEvent.endTime.minutes);
          }

          var result = {};
          result.action = $scope.newEvent.forUpdate ? 'update' : 'create';
          result.calendarId = $scope.newEvent.calendarId;
          result.calendarEvent = $scope.newEvent;

          // if($scope.newEvent.forUpdate) {
          //
          //   // result.calendarId = $scope.newEvent.calendar._id;
          //   // result.calendarEvent = $scope.newEvent;
          //
          //   // $scope.$emit('calendarEvent.update', $scope.newEvent.calendar._id, $scope.newEvent);
          // } else {
          //   t
          //   // result.calendarId = $scope.newEvent.calendar._id;
          //   // result.calendarEvent = $scope.newEvent;
          //   //
          //   // $scope.$emit('calendarEvent.create', $scope.newEvent.calendar._id,
          //   //   $scope.newEvent);
          // }
          $modalInstance.close(result);
        }
      };

      $scope.delete = function () {
        // if($scope.newEvent.forUpdate) {
        //   $scope.$emit('calendarEvent.delete', config.calendarEvent.calendarId, config.calendarEvent
        //     ._id);
        // }

        var result = {};
        result.action = 'delete';
        result.calendarId = config.calendarEvent.calendarId;
        result.calendarEvent = config.calendarEvent;

        $modalInstance.close(result);
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

  }
})(this.angular);
