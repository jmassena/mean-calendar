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
      templateUrl: './app/calendar/month-view/calendarMonthView.templ.html',
      scope: {
        calendarEventsCache: '=',
        calendars: '=',
        viewStart: '=',
        viewEnd: '='
      },

      link: function (scope, element, attrs) {

        $(window).on('resize.monthview', function () {

          var maxEvents = scope.calculateMaxEvents(window.innerHeight);

          if(scope.previousMaxEvents !== maxEvents) {
            scope.$apply(function () {
              scope.trimDayEvents(maxEvents);
            });
          }
        });

        scope.$on('$destroy', function () {
          $(window).off('resize.monthview');
        });
      },

      controller: CalendarMonthViewCtrl

    };
  }

  CalendarMonthViewCtrl.$inject = ['$scope', '$timeout', '$modal', '$window', 'UtilitySvc',
    'CalendarEditSvc', 'Week', 'Day'
  ];

  function CalendarMonthViewCtrl($scope, $timeout, $modal, $window, UtilitySvc, CalendarEditSvc,
    Week, Day) {

    // $scope.calendarEventsCache: '=',
    // $scope.calendars: '=',
    // $scope.viewStart: '=',
    // $scope.viewEnd: '='

    // $scope.previousMaxEvents;
    // $scope.monthView;
    // $scope.trimmedMonthView;

    $scope.trimDayEvents = trimDayEvents;
    $scope.calculateMaxEvents = calculateMaxEvents;

    activate();

    function activate() {

      $scope.$watch(function () {
          return $scope.monthView;
        },
        function (newVal, oldVal) {
          if(newVal !== oldVal) {
            var maxEvents = calculateMaxEvents();
            $scope.trimDayEvents(maxEvents);
          }
        });

      // handle cache reassigned
      $scope.$watch(function () {
          return $scope.calendarEventsCache;
        },
        function (newVal, oldVal) {
          if(newVal) {
            createMonthView();
          }
        });
    }

    function calculateMaxEvents(viewHeight) {
      viewHeight = viewHeight || $window.innerHeight;
      var containerHeight = 0.8 * viewHeight;
      var weekHeight = 0.2 * containerHeight;

      // for now this will be static but later can change this based on browser zoom and actual font-size I hope.
      var eventHeight = 21;
      var maxEvents = Math.floor((weekHeight - 20) / eventHeight);

      return maxEvents;
    }

    function trimDayEvents(maxEvents) {

      if(!$scope.monthView.weeks) {
        // object might not be initialized from web service call yet.
        console.log('not really trimming events');
        return;
      }

      console.log('trimming events: ' + maxEvents);

      $scope.previousMaxEvents = maxEvents;

      // build $scope.trimmedMonthView from monthView.
      var tmpMonthView = angular.copy($scope.monthView);

      tmpMonthView.weeks.forEach(function (week) {
        if(week.eventRowsCount > maxEvents + 1) {
          week.eventRowsCount = maxEvents + 1;

          week.eventRowIndexes = [];
          for(var i = 0; i < week.eventRowsCount; i++) {
            week.eventRowIndexes.push(i);
          }

          week.days.forEach(function (day) {

            if(day.events.length > maxEvents) {
              var removedEventsCount = 0;
              while(day.events.length > 0 && day.events.length >= maxEvents) {
                var event = day.events.pop();
                if(!event.fillerEvent) {
                  removedEventsCount++;
                }
              }

              // now add 'more events' and then filler;

              day.setMoreEvents(removedEventsCount);

              day.setLastFillerEvent(week.eventRowsCount - day.events.length);

            }
          });
        }
      });

      $scope.trimmedMonthView = tmpMonthView;
    }

    function createMonthView() {

      var calendarsHash = {};
      $scope.calendars.items.forEach(function (calendar) {
        calendarsHash[calendar._id.toString()] = calendar;
      });

      var allEvents = [];
      $scope.calendarEventsCache.calendars.forEach(function (calendar) {
        allEvents = allEvents.concat(calendar.events);
      });

      allEvents.sort(function (a, b) {
        var msDiff = a.start - b.start;
        if(msDiff === 0) {
          return UtilitySvc.dateDiffInDays(b.start, b.end) - UtilitySvc.dateDiffInDays(a.start,
            a.end);
        }
        return msDiff;
      });

      //update events with calendar data
      allEvents.forEach(function (event) {
        event.calendar = calendarsHash[event.calendarId];
      });

      $scope.monthView = {};
      $scope.monthView.weeks = [];

      var week;
      var day;
      var nextDay;
      var i;

      var tmp = new Date($scope.viewStart);
      tmp.setDate(tmp.getDate() + 15);

      var monthIndex = tmp.getMonth();

      // create week object with days
      for(var d = new Date($scope.viewStart); d < $scope.viewEnd; d.setDate(d.getDate() +
          1)) {

        if(d.getDay() === 0) {
          // new week
          week = new Week();
          $scope.monthView.weeks.push(week);
        }

        day = new Day(d);
        day.isInMonth = monthIndex === day.date.getMonth();
        week.days.push(day);
      }

      // add events to days.
      var eventIdx = 0;
      for(i = 0; i < $scope.monthView.weeks.length && eventIdx < allEvents.length; i++) {

        week = $scope.monthView.weeks[i];

        for(var j = 0; j < week.days.length; j++) {
          day = week.days[j];

          nextDay = UtilitySvc.dateAdd(day.date, {
            days: 1
          });

          // event starts before start of tomorrow and
          // ends after start of today.
          while(eventIdx < allEvents.length && allEvents[eventIdx].start < nextDay &&
            allEvents[eventIdx].end >= day.date) {

            var event = allEvents[eventIdx];

            if(event.calendar.showEvents) {
              if(UtilitySvc.dateDiffInDays(event.start, event.end) > 0) {
                addMultiDayEventToMonth(i, j, event);
              } else {
                day.setNextAvailableEvent(event);
              }
            }
            eventIdx++;
          }
        }
      }

      // make all days have same number of events.
      // or at least if day event count is less than max
      // then add an empty event with rowSpan value of max - day.events.count - 1;

      // add spacer event (last row) to each day

      $scope.monthView.weeks.forEach(function (week) {

        // max events in a day + 1 row for spacer.
        week.eventRowsCount = week.days.reduce(function (prev, current) {
          return Math.max(prev, current.events.length);
        }, 0) + 1;

        week.eventRowIndexes = [];
        for(i = 0; i < week.eventRowsCount; i++) {
          week.eventRowIndexes.push(i);
        }

        // add last filler event to each day
        week.days.forEach(function (day) {

          day.setLastFillerEvent(week.eventRowsCount - day.events.length);

          // add spacer events for gaps between events
          for(var i = 0; i < day.events.length; i++) {
            if(!day.events[i]) {

              day.setFillerEventAt(i);

            }
          }
        });
      });
    }

    function addMultiDayEventToMonth(weekIdx, dayIdx, calendarEvent) {
      // do while event is in current week range.
      for(var i = weekIdx; i < $scope.monthView.weeks.length; i++) {
        var week = $scope.monthView.weeks[i];

        var isEventEnded = addMultiDayEventToWeek(week, dayIdx, calendarEvent);

        if(isEventEnded) {
          break;
        } else {
          dayIdx = 0;
        }
      }
    }

    function addMultiDayEventToWeek(week, dayIdx, calendarEvent) {

      var isEventEnded = false;

      var startNextWeek = new Date(week.days[0].date);
      startNextWeek.setDate(startNextWeek.getDate() + 7);

      var wrappedEvent;
      for(var i = dayIdx; i < week.days.length && calendarEvent.end >= week.days[i].date; i++) {

        var day = week.days[i];

        if(i === dayIdx) {
          // when adding event to start day find next available idx and use this for all days that event spans.
          wrappedEvent = day.setNextAvailableEvent(calendarEvent);
        } else {
          wrappedEvent = day.setEvent(calendarEvent, wrappedEvent.index);
        }

        if(i === dayIdx) {
          wrappedEvent.isEventStart = true;
          wrappedEvent.isInterWeekContinuation = wrappedEvent.start < week.days[0].date;
          wrappedEvent.isInterWeekContinued = wrappedEvent.end >= startNextWeek;
          wrappedEvent.daySpanInWeek = Math.min(UtilitySvc.dateDiffInDays(day.date, wrappedEvent.end) +
            1,
            7 - dayIdx);
        }
        //  else if(i === week.length - 1) {
        //   wrappedEvent.isInterWeekContinued = wrappedEvent.end >= startNextWeek;
        // }
        else {
          wrappedEvent.isIntraWeekContinuation = true;
        }

        // var nextDay = new Date(day.date);
        // nextDay.setDate(nextDay.getDate() + 1);
        var nextDay = UtilitySvc.dateAdd(day.date, {
          days: 1
        });

        isEventEnded = wrappedEvent.end < nextDay;
        wrappedEvent.isEventEnd = isEventEnded;

        if(isEventEnded) {
          break;
        }
      }

      return isEventEnded;
    }

    /****************************************
    /* Modals
    /****************************************/
    $scope.openDayEventsDialog = function ($event, date) {

      $event.stopPropagation();

      var day;
      for(var i = 0; i < $scope.monthView.weeks.length; i++) {
        var week = $scope.monthView.weeks[i];

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

        templateUrl: './app/calendar/modals/modal-calendar-day-events.templ.html',

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

        templateUrl: './app/calendar/modals/modal-calendar-event-details.templ.html',

        controller: function ($scope, $modalInstance, calendarEvent) {
          $scope.calendarEvent = calendarEvent;

          $scope.cancel = function () {
            $modalInstance.dismiss();
          };

          $scope.edit = function ($event, calendarEvent) {
            $modalInstance.dismiss();
            return $scope.openCreateDialog($event, null, calendarEvent);
          };

          $scope.delete = function (calendarEvent) {
            $scope.$emit('calendarEvent.delete', calendarEvent.calendarId,
              calendarEvent._id);
            $modalInstance.dismiss();
          };
        }

      });

    };

    $scope.openCreateDialog = function ($event, dayDate, calendarEvent) {

      var modalInstance;
      if(calendarEvent) {
        modalInstance = CalendarEditSvc.openEditDialog(calendarEvent, $scope.calendars);
      } else {
        modalInstance = CalendarEditSvc.openCreateDialog(dayDate, $scope.calendars);
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

}(this.angular));
