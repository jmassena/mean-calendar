(function (angular) {
  'use strict';

  angular.module('app')
    .directive('calendarMonthView', calendarMonthView);

  calendarMonthView.$inject = ['$timeout', '$modal', '$window', 'UtilitySvc', 'CalendarEditSvc'];

  function calendarMonthView($timeout, $modal, $window, UtilitySvc, CalendarEditSvc) {

    // renders the calendar name, color, dropdown arrow for setting properties
    // emits events to communicate with calendar controller for setting color or deactivating calendar.
    return {
      restrict: 'E',
      templateUrl: './app/calendar/calendarMonthView.templ.html',
      scope: {
        monthViewEvents: '=',
        calendarList: '='
      },

      link: function (scope, element, attrs) {

        $(window).on('resize.monthview', function () {
          scope.trimDayEvents(window.innerHeight, true);
        });

        scope.$on('$destroy', function () {
          $(window).off('resize.monthview');
        });

      },

      controller: function ($scope) {

        $scope.trimDayEvents = trimDayEvents;

        // $scope.trimDayEvents();

        $scope.$watch(function () {
            return $scope.monthViewEvents.weeks;
          },
          function (newVal, oldVal) {
            if(newVal && oldVal !== newVal) {
              $scope.trimDayEvents();
            }
          });

        function trimDayEvents(viewHeight, doDigest) {
          viewHeight = viewHeight || $window.innerHeight;
          var containerHeight = 0.8 * viewHeight;
          var weekHeight = 0.2 * containerHeight;

          // for now this will be static but later can change this based on browser zoom and actual font-size I hope.
          var eventHeight = 21;
          var maxEvents = Math.floor((weekHeight - 20) / eventHeight);

          console.log('');
          console.log('max events: ' + maxEvents);
          console.log('viewHeight: ' + viewHeight);
          console.log('containerHeight: ' + containerHeight);
          console.log('weekHeight: ' + weekHeight);
          console.log('eventHeight: ' + eventHeight);

          if(!$scope.monthViewEvents.weeks) {
            // object might not be initialized from web service call yet.
            return;
          }

          if($scope.previousMaxEvents === maxEvents) {
            return;
          }

          // build $scope.trimmedMonthViewEvents from monthViewEvents.
          var tmpMonthView = angular.copy($scope.monthViewEvents);

          tmpMonthView.weeks.forEach(function (week) {
            if(week.eventRowsCount > maxEvents + 1) {
              week.eventRowsCount = maxEvents + 1;

              week.eventRowIndexes = [];
              for(var i = 0; i < week.eventRowsCount; i++) {
                week.eventRowIndexes.push(i);
              }

              week.days.forEach(function (day) {

                if(day.events.length > maxEvents + 1) {
                  var removedEventsCount = 0;
                  while(day.events.length >= maxEvents) {
                    var event = day.events.pop();
                    if(!event.fillerEvent) {
                      removedEventsCount++;
                    }
                  }

                  // now add 'more events' and then filler;
                  day.events.push({
                    moreEventsCount: removedEventsCount,
                    date: day.date
                  });

                  day.events.push({
                    fillerEvent: true,
                    lastEvent: true,
                    rowSpan: week.eventRowsCount - day.events.length,
                    date: day.date
                  });
                }
              });
            }
          });

          $scope.trimmedMonthViewEvents = tmpMonthView;
          if(doDigest) {
            $scope.$apply();
          }
        }

        $scope.openDayEventsDialog = function ($event, date) {

          $event.stopPropagation();

          var day;
          for(var i = 0; i < $scope.monthViewEvents.weeks.length; i++) {
            var week = $scope.monthViewEvents.weeks[i];

            for(var j = 0; j < week.days.length; j++) {

              if(week.days[j].date.getTime() === date.getTime()) {
                day = week.days[j];
                break;
              }
            }
          }

          if(!day) {
            throw new Error('Day for date not found. Date: ' + date.toString());
          }

          var modalInstance = $modal.open({
            windowClass: 'modal fade in',
            size: 'sm',
            scope: $scope,
            resolve: {
              day: function () {
                return day;
              }
            },

            templateUrl: './app/calendar/modal-calendar-day-events.templ.html',

            controller: function ($scope, $modalInstance, day) {

              $scope.day = day;

              $scope.cancel = function () {
                $modalInstance.dismiss();
              };

              $scope.openDetails = function ($event, calendarEvent) {
                $modalInstance.dismiss();
                return $scope.openDetailsDialog($event, calendarEvent);
              };
            }

          });
        };

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
