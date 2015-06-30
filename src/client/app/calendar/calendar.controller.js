(function (angular) {
  'use strict';

  angular.module('app')
    .controller('CalendarCtrl', CalendarCtrl);

  CalendarCtrl.$inject = ['$scope', '$q', 'CalendarSvc', 'CalendarEventSvc',
    'GlobalNotificationSvc', 'UtilitySvc'
  ];

  function CalendarCtrl($scope, $q, CalendarSvc, CalendarEventSvc, GlobalNotificationSvc,
    UtilitySvc) {

    /* jshint maxstatements:50 */
    var vm = this;

    vm.calendarList = {
      items: []
    };
    vm.calendarEvents = [];
    vm.monthViewEvents = {};
    // vm.calendar;
    vm.calendarStart;
    vm.calendarEnd;

    vm.updateCalendar = updateCalendar;

    activate();

    function activate() {

      // calculate start/end for current month.
      // if start is not a sunday then move start to prev sunday.
      // same for end
      var now = new Date(),
        year = now.getFullYear(),
        month = now.getMonth();

      var firstDay = new Date(year, month, 1);
      if(firstDay.getDay() !== 0) {
        // move to previous sunday if necessary
        firstDay.setDate(firstDay.getDate() - firstDay.getDay());
      }

      var lastDay = new Date(year, month + 1, 1);
      if(lastDay.getDay() !== 0) {
        // move to next monday (this is exclusive)
        lastDay.setDate(lastDay.getDate() + (7 - lastDay.getDay()));
      }

      vm.calendarStart = firstDay;
      vm.calendarEnd = lastDay;

      // get calendars or create default calendar
      // we can do the creation asynchronously
      CalendarSvc.getCalendarList()
        .then(function (res) {
          if(res.data && res.data.length > 0) {
            vm.calendarList.items = res.data;
          } else {
            //createCalendar('My calendar');
            return CalendarSvc.createCalendar('My calendar')
              .then(function (res) {
                if(res && res.data) {
                  vm.calendarList.items = [res.data];
                } else {
                  throw new Error('Error creating calendar');
                }
              }, function (res) {
                throw new Error(res.data.message);
              });
          }
        }, function (res) {
          throw new Error(res.data.message);
        })
        .then(function () {
          return getAndRenderMonthViewCalendarEvents();
        })
        .then(null,
          function (err) {
            console.error(err);
            GlobalNotificationSvc.addError(err.message);
            throw err;
          });
    }

    function createMonthView() {
      // merge all events into one list ordered by start date;
      // generate all month dates and for each date add events
      // from merged list.
      // for now assume all dates are within a single day.

      // for(var i = 0; i < vm.calendarEvents.length; i++) {
      //   allEvents = allEvents.concat(vm.calendarEvents[i]);
      // }
      //
      // var allEvents = vm.calendarEvents.reduce(function(prev,curr){
      //   return prev.concat(curr);
      // });

      var allEvents = Array.prototype.concat.apply([], vm.calendarEvents);

      allEvents.sort(function (a, b) {
        return a.start - b.start;
      });

      // month view for rendering multi-day events with colspan
      // for each day
      //   for each event
      //     record daySpanInWeek for first event in week.
      //     repeat event for each day event is on and mark as isInterWeekContinuation
      //     so we don't render anything for it.
      //
      //     repeat event for each week that event is in.
      //     record isContinuedFromLastWeek, isContinuedNextWeek, isInterWeekContinuation
      //
      //
      // Then when we render we can use these indicators for:
      //   daySpanInWeek: colspan.
      //   isInterWeekContinuation do not render
      //   isContinuedNextWeek: style right border like >
      //   isContinuedFromLastWeek: style left border like <

      // create monthView with all days. Mark prev/nextMonth days as such so we can style them differently.
      // iterate over events in date order and add them to the days.
      // if event goes spans multiple days then call function to add it to all days it spans.

      //vm.monthViewEvents.weeks = [];
      vm.monthViewEvents = {};
      vm.monthViewEvents.weeks = [];

      var week;
      var day;
      var nextDay;
      var i;

      // create week object with days
      for(var d = new Date(vm.calendarStart); d < vm.calendarEnd; d.setDate(d.getDate() + 1)) {

        if(d.getDay() === 0) {
          // new week
          week = new Week();
          vm.monthViewEvents.weeks.push(week);
        }

        day = new Day(d);

        week.days.push(day);
      }

      // add events to days.
      var eventIdx = 0;
      for(i = 0; i < vm.monthViewEvents.weeks.length; i++) {
        week = vm.monthViewEvents.weeks[i];

        for(var j = 0; j < week.days.length; j++) {
          day = week.days[j];

          nextDay = UtilitySvc.dateAdd(day.date, {
            days: 1
          });

          while(eventIdx < allEvents.length && allEvents[eventIdx].start >= day.date &&
            allEvents[eventIdx].start < nextDay) {

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

      vm.monthViewEvents.weeks.forEach(function (week) {

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
      for(var i = weekIdx; i < vm.monthViewEvents.weeks.length; i++) {
        var week = vm.monthViewEvents.weeks[i];

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

    function getAndRenderMonthViewCalendarEvents() {

      var calendarIds = vm.calendarList.items.map(function (calendar) {
        return calendar._id;
      });

      return getCalendarEvents(calendarIds, vm.calendarStart, vm.calendarEnd)
        .then(function () {
          // trying to get initial calendar data to render on android. This seems to fix it.
          $scope.$evalAsync(createMonthView);
        }, function (res) {
          throw new Error(res.data.message);
        })
        .then(null, function (err) {
          GlobalNotificationSvc.addError(err.message);
          throw err;
        });
    }

    function getCalendarEvents(calendarIdList, start, end) {
      var promises = calendarIdList.map(function (calendarId) {
        return CalendarEventSvc.getEventsList(calendarId, start, end);
      });

      return $q.all(promises)
        .then(function (results) {
          vm.calendarEvents = [];
          for(var i = 0; i < results.length; i++) {
            vm.calendarEvents.push(results[i].data);
          }
        }, function (res) {
          throw new Error(res.data.message);
        })
        .then(null,
          function (err) {
            console.error(err);
            GlobalNotificationSvc.addError(err.message);
            throw err;
          });
    }

    $scope.$on('calendar.toggleCalendarEvents', function (event, calendar) {
      event.stopPropagation();
      calendar.config.showEvents = !calendar.config.showEvents;
      updateCalendar(calendar);
    });

    $scope.$on('mycalendar.create', function (event, title) {
      event.stopPropagation();
      createCalendar(title);
    });

    $scope.$on('mycalendar.delete', function (event, calendarId) {
      event.stopPropagation();
      deleteCalendar(calendarId);
    });

    $scope.$on('calendarEvent.create', function (event, calendarId, calendarEvent) {
      event.stopPropagation();
      createCalendarEvent(calendarId, calendarEvent);
    });

    $scope.$on('calendarEvent.update', function (event, calendarId, calendarEvent) {
      event.stopPropagation();
      updateCalendarEvent(calendarId, calendarEvent);
    });

    $scope.$on('calendarEvent.delete', function (event, calendarId, calendarEventId) {
      event.stopPropagation();
      deleteCalendarEvent(calendarId, calendarEventId);
    });

    function createCalendarEvent(calendarId, calendarEvent) {
      CalendarEventSvc.createEvent(calendarId, calendarEvent)
        .then(function () {
          getAndRenderMonthViewCalendarEvents();
        });
    }

    function updateCalendarEvent(calendarId, calendarEvent) {
      CalendarEventSvc.updateEvent(calendarId, calendarEvent)
        .then(function () {
          getAndRenderMonthViewCalendarEvents();
        });
    }

    function deleteCalendarEvent(calendarId, calendarEventId) {
      CalendarEventSvc.deleteEvent(calendarId, calendarEventId)
        .then(function () {
          getAndRenderMonthViewCalendarEvents();
        });
    }

    function deleteCalendar(calendarId) {
      CalendarSvc.deleteCalendar(calendarId)
        .then(function (res) {
          for(var i = 0; i < vm.calendarList.items.length; i++) {
            if(vm.calendarList.items[i]._id === calendarId) {
              vm.calendarList.items.splice(i, 1);
            }
          }
        })
        .then(null,
          function (res) {
            console.error(res);
            GlobalNotificationSvc.addError(res.data.message);
          });
    }

    function createCalendar(title) {
      CalendarSvc.createCalendar(title)
        .then(function (res) {
          if(!res.data) {
            GlobalNotificationSvc.addError('Calendar create failed');
          }
          vm.calendarList.items.push(res.data);
        })
        .then(null,
          function (res) {
            console.error(res);
            GlobalNotificationSvc.addError(res.data.message);
          });
    }

    function updateCalendar(calendar) {
      CalendarSvc.updateCalendar(calendar)
        .then(function (res) {
          if(!res.data) {
            GlobalNotificationSvc.addError('Calendar update failed');
          }
          // TODO: do i really need to update he local calendar from db when it was changed locally first?
          var cal = res.data;
          for(var i = 0; i < vm.calendarList.items.length; i++) {
            if(vm.calendarList.items[i]._id === cal._id) {
              vm.calendarList.items[i] = cal;
              break;
            }
          }
        })
        .then(null,
          function (res) {
            console.error(res);
            GlobalNotificationSvc.addError(res.data.message);
          });
    }
  }

}(this.angular));
