(function (angular) {
  'use strict';

  angular.module('app')
    .controller('CalendarCtrl', CalendarCtrl);

  CalendarCtrl.$inject = ['$scope', '$q', 'CalendarSvc', 'CalendarEventSvc',
    'GlobalNotificationSvc', 'UtilitySvc', 'CalendarEventsCache', 'Calendars'
  ];

  function CalendarCtrl($scope, $q, CalendarSvc, CalendarEventSvc, GlobalNotificationSvc,
    UtilitySvc, CalendarEventsCache, Calendars) {

    /* jshint maxstatements:50 */
    var vm = this;
    vm.view = 'month';
    vm.viewDate = new Date();
    vm.calendars = new Calendars();
    vm.calendarEventsCache = new CalendarEventsCache();
    vm.updateCalendar = updateCalendar;
    vm.getCalendarEvents = getCalendarEvents;
    vm.getCalendarsList = getCalendarsList;
    vm.addViewMonth = addViewMonth;
    vm.setViewMonthToday = setViewMonthToday;

    activate();

    function activate() {

      // fetch month view data + calendars
      calculateMonthViewDates(vm.viewDate);

      vm.getCalendarsList()
        .then(function (data) {
          return vm.getCalendarEvents(vm.calendars.getIds(), vm.calendarStart,
            vm.calendarEnd);
        });
    }

    function addViewMonth(months) {
      vm.viewDate.setMonth(vm.viewDate.getMonth() + months);
      calculateMonthViewDates(vm.viewDate);
      cacheCalendarEventsGet();
    }

    function setViewMonthToday() {
      vm.viewDate = new Date();
      calculateMonthViewDates(vm.viewDate);
      cacheCalendarEventsGet();
    }

    function cacheCalendarEventsGet() {
      // TODO: if cache does not have range requested then get it from db and add it.
      getCalendarEvents(vm.calendars.getIds(), vm.calendarStart, vm.calendarEnd);
    }

    function calculateMonthViewDates(dt) {
      // calculate start/end for current month.
      // if start is not a sunday then move start to prev sunday.
      // same for end

      dt = dt || new Date();

      var year = dt.getFullYear();
      var month = dt.getMonth();

      var firstDay = new Date(year, month, 1);
      var lastDay = new Date(year, month + 1, 1);

      if(firstDay.getDay() !== 0) {
        // move to previous sunday if necessary
        firstDay.setDate(firstDay.getDate() - firstDay.getDay());
      }

      if(lastDay.getDay() !== 0) {
        // move to next monday (this is exclusive)
        lastDay.setDate(lastDay.getDate() + (7 - lastDay.getDay()));
      }

      vm.calendarStart = firstDay;
      vm.calendarEnd = lastDay;
    }

    /* CalendarEvents functions */
    function getCalendarEvents(calendarIdList, start, end) {
      var promises = calendarIdList.map(function (calendarId) {
        return CalendarEventSvc.getEventsList(calendarId, start, end);
      });

      return $q.all(promises)
        .then(function (responses) {
          vm.calendarEventsCache.calendars = [];
          for(var i = 0; i < responses.length; i++) {
            vm.calendarEventsCache.calendars.push(responses[i].data);
          }

          vm.calendarEventsCache = angular.copy(vm.calendarEventsCache);

        }, function (res) {
          throw new Error(res.data.message);
        })
        .then(null,
          function (err) {
            GlobalNotificationSvc.addError(err.message);
            throw err;
          });
    }

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
        .then(function (res) {
          vm.calendarEventsCache.addEvent(res.data);
          vm.calendarEventsCache = angular.copy(vm.calendarEventsCache);
        });
    }

    function updateCalendarEvent(calendarId, calendarEvent) {
      CalendarEventSvc.updateEvent(calendarId, calendarEvent)
        .then(function (res) {
          vm.calendarEventsCache.replaceEvent(res.data);
          vm.calendarEventsCache = angular.copy(vm.calendarEventsCache);
        });
    }

    function deleteCalendarEvent(calendarId, calendarEventId) {
      CalendarEventSvc.deleteEvent(calendarId, calendarEventId)
        .then(function (res) {
          vm.calendarEventsCache.deleteEvent(res.data._id);
          vm.calendarEventsCache = angular.copy(vm.calendarEventsCache);
        });
    }

    $scope.$on('calendar.toggleCalendarEvents', function (event, calendar) {
      event.stopPropagation();
      calendar.showEvents = !calendar.showEvents;
      updateCalendar(calendar);
    });

    $scope.$on('mycalendar.create', function (event, calendar) {
      event.stopPropagation();
      createCalendar(calendar);
    });

    $scope.$on('mycalendar.delete', function (event, calendarId) {
      event.stopPropagation();
      deleteCalendar(calendarId);
    });

    $scope.$on('mycalendar.update', function (event, calendar) {
      event.stopPropagation();
      updateCalendar(calendar);
    });

    /* Calendars functions */
    function getCalendarsList() {
      return CalendarSvc.getCalendarList()
        .then(function (res) {
          if(res.data && res.data.length > 0) {
            vm.calendars = new Calendars(res.data);
            return res.data;
          } else {
            // create a calendar if none exists for the user.
            return CalendarSvc.createDefaultCalendar()
              .then(function (res) {
                if(res && res.data) {
                  vm.calendars = new Calendars(res.data);
                  return res.data;
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
        .then(function (data) {
            return data;
          },
          function (err) {
            console.error(err);
            GlobalNotificationSvc.addError(err.message);
            throw err;
          });
    }

    function deleteCalendar(calendarId) {
      CalendarSvc.deleteCalendar(calendarId)
        .then(function (res) {
          for(var i = 0; i < vm.calendars.items.length; i++) {
            if(vm.calendars.items[i]._id === calendarId) {
              vm.calendars.items.splice(i, 1);
              vm.calendars = angular.copy(vm.calendars);
              vm.calendarEventsCache.deleteCalendar(res.data);
              vm.calendarEventsCache = angular.copy(vm.calendarEventsCache);

              return;
            }
          }
        })
        .then(null,
          function (res) {
            console.error(res);
            GlobalNotificationSvc.addError(res.data.message);
          });
    }

    function createCalendar(calendar) {
      CalendarSvc.createCalendar(calendar)
        .then(function (res) {
          if(!res.data) {
            GlobalNotificationSvc.addError('Calendar create failed');
          }
          vm.calendars.items.push(res.data);
          vm.calendars = angular.copy(vm.calendars);
          vm.calendarEventsCache.addCalendar(res.data);
          vm.calendarEventsCache = angular.copy(vm.calendarEventsCache);
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
          var cal = res.data;
          for(var i = 0; i < vm.calendars.items.length; i++) {
            if(vm.calendars.items[i]._id === cal._id) {
              vm.calendars.items[i] = cal;
              vm.calendars = angular.copy(vm.calendars);
              vm.calendarEventsCache = angular.copy(vm.calendarEventsCache);

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
