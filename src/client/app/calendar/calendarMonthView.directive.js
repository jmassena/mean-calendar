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

      link: function (scope, element, attrs) {

        $(window).on('resize.monthview', function () {
          scope.trimDayEvents(window.innerHeight, false, true);
        });

        scope.$on('$destroy', function () {
          $(window).off('resize.monthview');
        });

      },

      controller: CalendarMonthViewCtrl

    };
  }

  CalendarMonthViewCtrl.$inject = ['$scope', '$timeout', '$modal', '$window', 'UtilitySvc',
    'CalendarEditSvc'
  ];

  function CalendarMonthViewCtrl($scope, $timeout, $modal, $window, UtilitySvc, CalendarEditSvc) {

    $scope.trimDayEvents = trimDayEvents;
    // $scope.monthViewEvents

    activate();

    function activate() {

      $scope.$watch(function () {
          return $scope.monthViewEvents;
        },
        function (newVal, oldVal) {
          if(newVal !== oldVal) {
            $scope.trimDayEvents(null, true, false);
          }
        });

      // handle cache modified
      $scope.$watch(function () {
          return $scope.eventsCache.eventsModifiedDate;
        },
        function (newVal, oldVal) {
          if(newVal) {
            createMonthView();
          }
        });

      // handle cache reassigned
      $scope.$watch(function () {
          return $scope.eventsCache.calendarEvents;
        },
        function (newVal, oldVal) {
          if(newVal) {
            createMonthView();
          }
        });
    }

    function trimDayEvents(viewHeight, force, doDigest) {
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

      if(!force && $scope.previousMaxEvents === maxEvents) {
        return;
      }
      $scope.previousMaxEvents = maxEvents;

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

            if(day.events.length > maxEvents) {
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

    function createMonthView() {

      // var allEvents = Array.prototype.concat.apply([], $scope.eventsCache.calendarEvents);
      var allEvents = [];
      $scope.eventsCache.calendarEvents.forEach(function (calendarEvent) {
        allEvents = allEvents.concat(calendarEvent.events);
      });

      allEvents.sort(function (a, b) {
        var msDiff = a.start - b.start;
        if(msDiff === 0) {
          return UtilitySvc.dateDiffInDays(b.start, b.end) - UtilitySvc.dateDiffInDays(a.start,
            a.end);
        }
        return msDiff;
      });

      $scope.monthViewEvents = {};
      $scope.monthViewEvents.weeks = [];

      var week;
      var day;
      var nextDay;
      var i;

      // create week object with days
      for(var d = new Date($scope.calendarStart); d < $scope.calendarEnd; d.setDate(d.getDate() +
          1)) {

        if(d.getDay() === 0) {
          // new week
          week = new Week();
          $scope.monthViewEvents.weeks.push(week);
        }

        day = new Day(d);
        week.days.push(day);
      }

      // add events to days.
      var eventIdx = 0;
      for(i = 0; i < $scope.monthViewEvents.weeks.length && eventIdx < allEvents.length; i++) {
        week = $scope.monthViewEvents.weeks[i];

        for(var j = 0; j < week.days.length; j++) {
          day = week.days[j];

          nextDay = UtilitySvc.dateAdd(day.date, {
            days: 1
          });

          // event starts before start of tomorrow and
          // ends after start of today.
          while(eventIdx < allEvents.length && allEvents[eventIdx].start < nextDay &&
            allEvents[eventIdx].end >= day.date) {

            var calendarEvent = allEvents[eventIdx];

            if(UtilitySvc.dateDiffInDays(calendarEvent.start, calendarEvent.end) > 0) {
              addMultiDayEventToMonth(i, j, calendarEvent);
            } else {
              day.setNextAvailableEvent(calendarEvent);
            }
            eventIdx++;
          }
        }
      }

      // make all days have same number of events.
      // or at least if day event count is less than max
      // then add an empty event with rowSpan value of max - day.events.count - 1;

      // add spacer event (last row) to each day

      $scope.monthViewEvents.weeks.forEach(function (week) {

        // max events in a day + 1 row for spacer.
        week.eventRowsCount = week.days.reduce(function (prev, current) {
          return Math.max(prev, current.events.length);
        }, 0) + 1;

        week.eventRowIndexes = [];
        for(i = 0; i < week.eventRowsCount; i++) {
          week.eventRowIndexes.push(i);
        }

        week.days.forEach(function (day) {
          day.events.push({
            fillerEvent: true,
            lastEvent: true,
            rowSpan: week.eventRowsCount - day.events.length,
            date: day.date
          });

          for(var i = 0; i < day.events.length; i++) {
            if(!day.events[i]) {
              day.events[i] = {
                fillerEvent: true,
                date: day.date
              };
            }
          }
        });
      });
    }

    function addMultiDayEventToMonth(weekIdx, dayIdx, calendarEvent) {
      // do while event is in current week range.
      for(var i = weekIdx; i < $scope.monthViewEvents.weeks.length; i++) {
        var week = $scope.monthViewEvents.weeks[i];

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
          wrappedEvent.daySpanInWeek = Math.min(UtilitySvc.dateDiffInDays(day.date, wrappedEvent.end) +
            1,
            7 - dayIdx);
        } else if(i === week.length - 1) {
          wrappedEvent.isInterWeekContinued = wrappedEvent.end >= startNextWeek;
        } else {
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

    /****************************************
    /* Classes
    /****************************************/
    function Week() {
      this.days = [];
    }

    Week.prototype.eventsAtIndex = function (idx) {
      var ret = [];

      this.days.forEach(function (day) {
        if(day.events[idx] && !day.events[idx].isIntraWeekContinuation) {
          ret.push(day.events[idx]);
        }
      });

      return ret;
    };

    function EventWrapper(calendarEvent) {

      angular.extend(this, calendarEvent);
    }

    EventWrapper.prototype.getDurationDays = function () {
      return UtilitySvc.dateDiffInDays(this.start, this.end);
    };

    EventWrapper.prototype.startTimeString = function () {
      return this.timeString(this.start);
    };

    EventWrapper.prototype.endTimeString = function () {
      return this.timeString(this.end);
    };

    EventWrapper.prototype.timeString = function (d) {
      return this.getTimeString(d, true);
    };

    EventWrapper.prototype.getCompleteTimeString = function (d) {
      return this.getTimeString(d, false);
    };

    EventWrapper.prototype.getTimeString = function (d, shortAmPm) {
      if(!d) {
        return '';
      }

      var amPm = shortAmPm ? 'a' : 'am';
      var hour = d.getHours();
      if(hour >= 12) {
        amPm = shortAmPm ? 'p' : 'pm';
        if(hour > 12) {
          hour -= 12;
        }
        if(hour === 0) {
          hour = '12';
        }
      }

      return hour + (d.getMinutes() > 0 ? ':' + d.getMinutes() : '') + amPm;
    };

    EventWrapper.prototype.displayString = function () {
      if(this.allDay) {
        return this.title;
      }
      return this.startTimeString() + ' ' + this.title;
    };

    EventWrapper.prototype.getDateRangeSummary = function () {

      var datesSummary = UtilitySvc.getMonthName(this.start).abbreviated + ' ' + this.start.getDate();

      if(UtilitySvc.startOfDate(this.start).getTime() === UtilitySvc.startOfDate(this.end).getTime()) {

        if(!this.allDay) {
          datesSummary += ', ' + this.getCompleteTimeString(this.start);
          datesSummary += ' - ' + this.getCompleteTimeString(this.end);
        }

      } else {

        if(!this.allDay) {
          datesSummary += ', ' + this.getCompleteTimeString(this.start);
        }

        datesSummary += ' - ' + UtilitySvc.getMonthName(this.end).abbreviated + ' ' + this.end.getDate();
        if(!this.allDay) {
          datesSummary += ', ' + this.getCompleteTimeString(this.end);
        }
      }

      return datesSummary;
    };

    function Day(d) {
      this.date = new Date(d);
      this.events = [];
    }

    Day.prototype.getVisibleEvents = function () {

      var ret = this.events.filter(function (event) {
        return !event.fillerEvent && !event.moreEventsCount;
      });

      return ret;
    };

    Day.prototype.getNextAvailableEventIndex = function () {
      for(var i = 0; i < this.events.length; i++) {
        if(!this.events[i]) {
          return i;
        }
      }

      return this.events.length;
    };

    Day.prototype.setNextAvailableEvent = function (calendarEvent) {

      var idx = this.getNextAvailableEventIndex();
      return this.setEvent(calendarEvent, idx);
    };

    Day.prototype.setEvent = function (calendarEvent, idx) {

      var wrappedEvent = new EventWrapper(calendarEvent);
      wrappedEvent.index = idx;
      this.events[idx] = wrappedEvent;
      return wrappedEvent;
    };

    Day.prototype.dayName = function () {
      // return this.dayNames[this.date.getDate()];
      return UtilitySvc.getDayName(this.date);

    };

    Day.prototype.monthName = function () {
      // return this.monthNames[this.date.getMonth()];
      return UtilitySvc.getMonthName(this.date);
    };

    Day.prototype.calendarDisplayDate = function () {
      var x = this.date.getDate() === 1 ?
        this.monthName().abbreviated + ' ' + this.date.getDate() :
        this.date.getDate();

      return x;
    };

  }

}(this.angular));
