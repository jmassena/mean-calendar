(function (angular) {
  'use strict';

  angular.module('app')
    .controller('CalendarCtrl', CalendarCtrl);

  CalendarCtrl.$inject = ['$scope', 'CalendarSvc', 'CalendarEventSvc', 'GlobalNotificationSvc',
    '$q'
  ];

  function CalendarCtrl($scope, CalendarSvc, CalendarEventSvc, GlobalNotificationSvc, $q) {

    /* jshint maxstatements:50 */
    var vm = this;

    vm.calendarList = {
      items: []
    };
    vm.calendarEvents = [];
    vm.monthViewEvents = {};
    vm.calendar;
    vm.calendarStart;
    vm.calendarEnd;

    vm.updateCalendar = updateCalendar;
    // vm.toggleCalendarEvents = toggleCalendarEvents;

    activate();

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

          nextDay = new Date(day.date);
          nextDay.setDate(nextDay.getDate() + 1);

          while(eventIdx < allEvents.length && allEvents[eventIdx].start >= day.date &&
            allEvents[eventIdx].start < nextDay) {

            var calendarEvent = allEvents[eventIdx];
            if(dateDiffInDays(calendarEvent.start, calendarEvent.end) > 0) {
              addMultiDayEventToMonth(i, j, calendarEvent);
            } else {

              day.setNextAvailableEvent(calendarEvent);
              // day.events.push(new EventWrapper(calendarEvent));
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
        }
      }
    }

    var _MS_PER_DAY = 1000 * 60 * 60 * 24;

    // a and b are javascript Date objects
    function dateDiffInDays(a, b) {
      // Discard the time and time-zone information.
      var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
      var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

      return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    function addMultiDayEventToWeek(week, dayIdx, calendarEvent) {

      var isEventEnded = false;

      var startNextWeek = new Date(week.days[0].date);
      startNextWeek.setDate(startNextWeek.getDate() + 7);

      var dayEventIdx;
      for(var i = dayIdx; i < week.days.length && calendarEvent.end >= week.days[i].date; i++) {

        var day = week.days[i];
        var wrappedEvent = new EventWrapper(calendarEvent);
        // day.events.push(wrappedEvent);

        // when adding event find next available idx and use this for all days that event spans.
        if(i === dayIdx) {
          dayEventIdx = day.setNextAvailableEvent(wrappedEvent);
        } else {
          day.setEvent(wrappedEvent, dayEventIdx);
        }

        if(i === dayIdx) {
          wrappedEvent.isEventStart = true;
          wrappedEvent.isInterWeekContinuation = calendarEvent.start < week.days[0].date;
          wrappedEvent.daySpanInWeek = Math.min(dateDiffInDays(day.date, calendarEvent.end) +
            1,
            7 - dayIdx);
        } else if(i === week.length - 1) {
          wrappedEvent.isInterWeekContinued = calendarEvent.end >= startNextWeek;
        } else {
          wrappedEvent.isIntraWeekContinuation = true;
        }

        var nextDay = new Date(day.date);
        nextDay.setDate(nextDay.getDate() + 1);

        isEventEnded = calendarEvent.end < nextDay;
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
      // return this.days.filter(function (day) {
      //   return day.events[idx] && !day.events[idx].isIntraWeekContinuation;
      // });
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

      // this.startTime = this.allDay ? null : new Date(this.start);
      // this.endTime = this.allDay ? null : new Date(this.end);
    }

    EventWrapper.prototype.startTimeString = function () {
      return this.timeString(this.start);
    };

    EventWrapper.prototype.endTimeString = function () {
      return this.timeString(this.end);
    };

    EventWrapper.prototype.timeString = function (dt) {
      if(!dt) {
        return '';
      }

      var hours = dt.getHours();
      var minutes = dt.getMinutes();
      var amPm = '';

      if(hours >= 12) {
        amPm = 'p';
      }

      if(hours === 0) {
        hours = 12;
      } else if(hours >= 13) {
        hours -= 12;
      }

      if(minutes > 0) {
        minutes = ':' + minutes;
      } else {
        minutes = '';
      }

      return hours + minutes + amPm;
    };

    EventWrapper.prototype.displayString = function () {
      if(this.allDay) {
        return this.title;
      }
      return this.startTimeString() + ' ' + this.title;
    };

    function Day(d) {
      this.date = new Date(d);
      this.events = [];
    }

    Day.prototype.getNextAvailableEventIndex = function () {
      for(var i = 0; i < this.events.length; i++) {
        if(!this.events[i]) {
          return i;
        }
      }

      return this.events.length;
    };

    Day.prototype.setNextAvailableEvent = function (wrappedEvent) {

      var idx = this.getNextAvailableEventIndex();
      this.events[idx] = wrappedEvent;
      return idx;
    };

    Day.prototype.setEvent = function (wrappedEvent, idx) {

      this.events[idx] = wrappedEvent;
    };

    Day.prototype.dayName = function () {
      return this.dayNames[this.date.getDate()];
    };

    Day.prototype.monthName = function () {
      return this.monthNames[this.date.getMonth()];
    };

    Day.prototype.calendarDisplayDate = function () {
      var x = this.date.getDate() === 0 ?
        this.monthName().abbreviated + ' ' + this.date.getDate() :
        this.date.getDate();

      return x;
    };

    Day.prototype.monthNames = [{
      full: 'January',
      abbreviated: 'Jan'
    }, {
      full: 'February',
      abbreviated: 'Feb'
    }, {
      full: 'March',
      abbreviated: 'Mar'
    }, {
      full: 'April',
      abbreviated: 'Apr'
    }, {
      full: 'May',
      abbreviated: 'May'
    }, {
      full: 'June',
      abbreviated: 'Jun'
    }, {
      full: 'July',
      abbreviated: 'Jul'
    }, {
      full: 'August',
      abbreviated: 'Aug'
    }, {
      full: 'September',
      abbreviated: 'Sep'
    }, {
      full: 'October',
      abbreviated: 'Oct'
    }, {
      full: 'November',
      abbreviated: 'Nov'
    }, {
      full: 'December',
      abbreviated: 'Dec'
    }];

    Day.prototype.dayNames = [{
      full: 'Sunday',
      abbreviated: 'Sun'
    }, {
      full: 'Monday',
      abbreviated: 'Mon'
    }, {
      full: 'Tuesday',
      abbreviated: 'Tues'
    }, {
      full: 'Wednesday',
      abbreviated: 'Wed'
    }, {
      full: 'Thursday',
      abbreviated: 'Thurs'
    }, {
      full: 'Friday',
      abbreviated: 'Fri'
    }, {
      full: 'Saturday',
      abbreviated: 'Sat'
    }];

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
          var calendarIds = vm.calendarList.items.map(function (calendar) {
            return calendar._id;
          });

          calendarIds = ['5578aa2b64a546cc922efb43'];

          return getCalendarEvents(calendarIds, vm.calendarStart, vm.calendarEnd)
            .then(function () {
              createMonthView();
            }, function (res) {
              throw new Error(res.data.message);
            })
            .then(null, function (err) {
              GlobalNotificationSvc.addError(err.message);
              throw err;
            });
        })
        .then(null,
          function (err) {
            console.error(err);
            GlobalNotificationSvc.addError(err.message);
            throw err;
          });
    }

    function getViewCalendarEvents() {

      var calendarIds = vm.calendarList.items.map(function (calendar) {
        return calendar._id;
      });

      return getCalendarEvents(calendarIds, vm.calendarStart, vm.calendarEnd)
        .then(function () {
          createMonthView();
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
          getViewCalendarEvents();
        });
    }

    function updateCalendarEvent(calendarId, calendarEvent) {
      CalendarEventSvc.updateEvent(calendarId, calendarEvent)
        .then(function () {
          getViewCalendarEvents();
        });
    }

    function deleteCalendarEvent(calendarId, calendarEventId) {
      CalendarEventSvc.deleteEvent(calendarId, calendarEventId)
        .then(function () {
          getViewCalendarEvents();
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
