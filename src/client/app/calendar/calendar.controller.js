(function (angular) {
  'use strict';

  angular.module('app')
    .controller('CalendarCtrl', CalendarCtrl);

  CalendarCtrl.$inject = ['CalendarSvc', 'GlobalNotificationSvc'];

  function CalendarCtrl(CalendarSvc, GlobalNotificationSvc) {

    var vm = this;

    vm.calendarList;
    vm.calendar;
    vm.calendarStart;
    vm.calendarEnd;

    vm.updateCalendar = updateCalendar;
    vm.toggleCalendarEvents = toggleCalendarEvents;

    activate();

    function activate() {

      // get calendars or create default calendar
      // we can do the creation asynchronously
      CalendarSvc.getCalendarList()
        .then(function (res) {
          if(res.data && res.data.length > 0) {
            vm.calendarList = res.data;
          } else {
            return CalendarSvc.createCalendar('My calendar')
              .then(function (res) {
                if(res && res.data) {
                  vm.calendarList = [res.data];
                } else {
                  throw new Error('Error creating calendar');
                }
              });
          }
        })
        .then(null,
          function (res) {
            console.error(res);
            GlobalNotificationSvc.addError(res.data.message);
          });
    }

    function toggleCalendarEvents(calendar) {
      calendar.config.showEvents = !calendar.config.showEvents;
      updateCalendar(calendar);
    }

    function updateCalendar(calendar) {
      CalendarSvc.updateCalendar(calendar)
        .then(function (res) {
          // TODO: check how this works in the error handler code which expects a response object....
          if(!res.data) {
            throw new Error('Calendar update failed');
          }
          // TODO: do i really need to update he local calendar from db when it was changed locally first?
          var cal = res.data;
          for(var i = 0; i < vm.calendarList.length; i++) {
            if(vm.calendarList[i]._id === cal._id) {
              vm.calendarList[i] = cal;
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
