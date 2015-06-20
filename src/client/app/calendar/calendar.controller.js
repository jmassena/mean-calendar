(function (angular) {
  'use strict';

  angular.module('app')
    .controller('CalendarCtrl', CalendarCtrl);

  CalendarCtrl.$inject = ['$scope', 'CalendarSvc', 'CalendarEventSvc', 'GlobalNotificationSvc', '$q'];

  function CalendarCtrl($scope, CalendarSvc, CalendarEventSvc, GlobalNotificationSvc, $q) {

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
      var allEvents = [];
      for(var i = 0; i < vm.calendarEvents.length; i++) {
        allEvents = allEvents.concat(vm.calendarEvents[i]);
      }

      allEvents.sort(function (a, b) {
        return a.start - b.start;
      });

      // if date spans days then
      //   if start.daynum + days > sat.daynum
      //     set colspan to

      // vm.monthViewEvents.weeks.dates.day
      // vm.monthViewEvents.weeks.dates.events
      //
      vm.monthViewEvents.weeks = [];

      var week;
      var eventIdx = 0;

      // create week object with day object with events
      for(var d = new Date(vm.calendarStart); d < vm.calendarEnd; d.setDate(d.getDate() + 1)) {

        if(d.getDay() === 0) {
          week = {};
          week.days = [];
          vm.monthViewEvents.weeks.push(week);
        }

        var day = {
          date: new DateWrapper(d),
          events: []
        };

        week.days.push(day);

        var nextDay = new Date(d);
        nextDay.setDate(d.getDate() + 1);

        //while next event is on today
        // NOTE: this will not handle events spanning days
        while(eventIdx < allEvents.length && allEvents[eventIdx].start >= d && allEvents[eventIdx].start < nextDay) {
          day.events.push(new EventWrapper(allEvents[eventIdx]));
          eventIdx++;
        }
      }
    }

    function EventWrapper(calendarEvent) {

      angular.extend(this, calendarEvent);

      // this.startTime = this.allDay ? null : new Date(this.start);
      // this.endTime = this.allDay ? null : new Date(this.end);
    }

    EventWrapper.prototype.startTimeString = function () {
      return this.timeString(this.startTime);
    };

    EventWrapper.prototype.endTimeString = function () {
      return this.timeString(this.endTime);
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

    function DateWrapper(d) {
      this.value = new Date(d);
    }

    DateWrapper.prototype.dayName = function () {
      return this.dayNames[this.value.getDate()];
    };

    DateWrapper.prototype.monthName = function () {
      return this.monthNames[this.value.getMonth()];
    };

    DateWrapper.prototype.calendarDisplayDate = function () {
      var x = this.value.getDate() === 0 ?
        this.monthName().abbreviated + ' ' + this.value.getDate() :
        this.value.getDate();

      return x;
    };

    DateWrapper.prototype.monthNames = [{
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

    DateWrapper.prototype.dayNames = [{
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
