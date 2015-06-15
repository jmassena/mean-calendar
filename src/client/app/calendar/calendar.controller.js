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
    vm.calendar;
    vm.calendarStart;
    vm.calendarEnd;

    vm.updateCalendar = updateCalendar;
    // vm.toggleCalendarEvents = toggleCalendarEvents;

    activate();

    function getMonthViewStartEndDates(year, month) {

    }

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
        // move to next sunday if necessary (end date is exclusive)
        lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
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
            .then(null, function (res) {
              throw new Error(res.data.message);
            });
        })
        .then(null,
          function (err) {
            console.error(err);
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
            vm.calendarEvents.push(results[i]);
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

    $scope.$on('calendar.toggleCalendarEvents', function toggleCalendarEvents(event, calendar) {
      event.stopPropagation();
      calendar.config.showEvents = !calendar.config.showEvents;
      updateCalendar(calendar);
    });

    $scope.$on('mycalendar.create', function handleCalendarCreate(event, title) {
      event.stopPropagation();
      createCalendar(title);
    });

    $scope.$on('mycalendar.delete', function handleCalendarDelete(event, calendarId) {
      event.stopPropagation();
      deleteCalendar(calendarId);
    });

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
