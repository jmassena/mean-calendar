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
        // trimDayEvents();

        // scope.$watch(function () {
        //     return $window.innerHeight + 'px';
        //   },
        //   function (newVal, oldVal) {
        //     console.log('window height: ' + newVal);
        //   });

        $(window).resize(function () {
          // console.log('JQ window height: ' + window.innerHeight);
          scope.trimDayEvents(window.innerHeight, true);
        });

        // $(window).on('resize.monthView', function () {
        //   // console.log('JQ window height: ' + window.innerHeight);
        //   scope.trimDayEvents(window.innerHeight);
        // });
        //
        // scope.$on('$destroy', function () {
        //   $(window).off('resize.monthView');
        // });

        // function trimDayEvents(viewHeight) {
        //   viewHeight = viewHeight || $window.innerHeight;
        //   var containerHeight = 0.8 * viewHeight;
        //   var weekHeight = 0.2 * containerHeight;
        //
        //   // for now this will be static but later can change this based on browser zoom and actual font-size I hope.
        //   var eventHeight = 21;
        //   var maxEvents = Math.floor((weekHeight - 20) / eventHeight);
        //
        //   // This is working better than I expected! Only issue is with sweet Nexus 5 items
        //   // innerHeight reads 640 but body height is actually 750?
        //   console.log('');
        //   console.log('max events: ' + maxEvents);
        //   console.log('viewHeight: ' + viewHeight);
        //   console.log('containerHeight: ' + containerHeight);
        //   console.log('weekHeight: ' + weekHeight);
        //   console.log('eventHeight: ' + eventHeight);
        //
        // }

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
