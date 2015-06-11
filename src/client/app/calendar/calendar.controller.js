(function (angular) {
  'use strict';

  angular.module('app')
    .controller('CalendarCtrl', CalendarCtrl);

  CalendarCtrl.$inject = ['$scope', 'CalendarSvc', 'GlobalNotificationSvc'];

  function CalendarCtrl($scope, CalendarSvc, GlobalNotificationSvc) {

    var vm = this;

    vm.calendarList = {
      items: []
    };
    vm.calendar;
    vm.calendarStart;
    vm.calendarEnd;

    vm.updateCalendar = updateCalendar;
    // vm.toggleCalendarEvents = toggleCalendarEvents;

    activate();

    function activate() {

      // get calendars or create default calendar
      // we can do the creation asynchronously
      CalendarSvc.getCalendarList()
        .then(function (res) {
          if(res.data && res.data.length > 0) {
            vm.calendarList.items = res.data;
          } else {
            return CalendarSvc.createCalendar('My calendar')
              .then(function (res) {
                if(res && res.data) {
                  vm.calendarList.items = [res.data];
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

    $scope.$on('calendar.toggleCalendarEvents', function toggleCalendarEvents(event, calendar) {
      event.stopPropagation();
      calendar.config.showEvents = !calendar.config.showEvents;
      updateCalendar(calendar);
    });

    $scope.$on('mycalendar.create', function handleCalendarCreate(event, title) {
      event.stopPropagation();
      createCalendar(title);
    });

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
