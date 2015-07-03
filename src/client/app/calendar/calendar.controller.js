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
    // var vm = this;

    // $scope.calendarList = {
    //   items: [],
    //   getIds: function () {
    //     return this.items.map(function (calendar) {
    //       return calendar._id;
    //     });
    //   }
    // };
    $scope.calendarList = new Calendars();

    function Calendars(list) {

      if(!list) {
        this.items = [];
      } else if(!list.length) {
        this.items = [list];
      } else {
        this.items = list;
      }
    }

    Calendars.prototype.getIds = function () {
      return this.items.map(function (calendar) {
        return calendar._id;
      });
    }

    $scope.eventsCache = new EventsCache();
    $scope.updateCalendar = updateCalendar;
    $scope.getCalendarEvents = getCalendarEvents;
    $scope.getCalendarsList = getCalendarsList;

    activate();

    function activate() {
      $scope.view = 'month';
      $scope.viewDate = new Date();
      calculateMonthViewDates($scope.viewDate);

      $scope.getCalendarsList()
        .then(function (data) {
          return $scope.getCalendarEvents($scope.calendarList.getIds(), $scope.calendarStart,
            $scope.calendarEnd);
        });
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

      $scope.calendarStart = firstDay;
      $scope.calendarEnd = lastDay;
    }

    function EventsCache() {
      this.isInitialized = false;
      this.calendarEvents = [];
      // this.calendars = [];
      this.ranges = [];
      this.eventsModifiedDate;
      // this.calendarsModifiedDate;
    }

    EventsCache.prototype.setModifiedDate = function () {

      this.eventsModifiedDate = new Date();
    };

    EventsCache.prototype.replaceEvent = function (event) {

      this.deleteEvent(event._id);
      this.addEvent(event);
    };

    EventsCache.prototype.deleteEvent = function (eventId) {

      for(var i = 0; i < this.calendarEvents.length; i++) {
        var calendarEvent = this.calendarEvents[i];

        for(var j = 0; j < calendarEvent.events.length; j++) {
          if(calendarEvent.events[j]._id === eventId) {
            calendarEvent.events.splice(j, 1);
            return;
          }
        }
      }
    };

    EventsCache.prototype.addEvent = function (event) {

      if(typeof event.start === 'string') {
        event.start = new Date(event.start);
      }
      if(typeof event.end === 'string') {
        event.end = new Date(event.end);
      }

      for(var i = 0; i < this.calendarEvents.length; i++) {

        // TODO: this is super confusing to have calendarEvents have events.
        var calendarEvent = this.calendarEvents[i];

        if(calendarEvent.calendarId === event.calendarId) {

          // if(calendarEvent.events.length === 0) {
          //   calendarEvent.events.push(event);
          //   return;
          // }
          //
          // for(var j = 0; j < calendarEvent.events.length; j++) {
          //   if(calendarEvent.events[j].start > event.start) {
          //     calendarEvent.events.splice(j, 0, event);
          //     return;
          //   }
          // }

          calendarEvent.events.push(event);
          return;
        }
      }
    };

    // EventsCache.prototype.hasEventsInRange(start,end){
    //   // range end is exclusive
    //   for(var i = 0; i < this.ranges.length; i++){
    //     if(this.ranges[i].start <= start && this.ranges[i].end >= end){
    //       return true;
    //     }
    //   }
    //   return false;
    // }
    //
    // EventsCache.prototype.addEvents(events,start,end){
    //   // range end is exclusive
    //   for(var i = 0; i < this.ranges.length; i++){
    //     if(this.ranges[i].start <= start && this.ranges[i].end >= end){
    //       return true;
    //     }
    //   }
    //   return false;
    // }
    //

    function getCalendarsList() {
      return CalendarSvc.getCalendarList()
        .then(function (res) {
          if(res.data && res.data.length > 0) {
            $scope.calendarList = new Calendars(res.data);
            return res.data;
          } else {
            // create a calendar if none exists for the user.
            return CalendarSvc.createCalendar('My calendar')
              .then(function (res) {
                if(res && res.data) {
                  $scope.calendarList = new Calendars(res.data);
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

    function getCalendarEvents(calendarIdList, start, end) {
      var promises = calendarIdList.map(function (calendarId) {
        return CalendarEventSvc.getEventsList(calendarId, start, end);
      });

      return $q.all(promises)
        .then(function (results) {
          $scope.eventsCache.calendarEvents = [];
          for(var i = 0; i < results.length; i++) {
            $scope.eventsCache.calendarEvents.push(results[i].data);
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
        .then(function (res) {
          $scope.eventsCache.addEvent(res.data);
          $scope.eventsCache.setModifiedDate();
        });
    }

    function updateCalendarEvent(calendarId, calendarEvent) {
      CalendarEventSvc.updateEvent(calendarId, calendarEvent)
        .then(function (res) {
          $scope.eventsCache.replaceEvent(res.data);
          $scope.eventsCache.setModifiedDate();
        });
    }

    function deleteCalendarEvent(calendarId, calendarEventId) {
      CalendarEventSvc.deleteEvent(calendarId, calendarEventId)
        .then(function (res) {
          $scope.eventsCache.deleteEvent(res.data._id);
          $scope.eventsCache.setModifiedDate();
        });
    }

    function deleteCalendar(calendarId) {
      CalendarSvc.deleteCalendar(calendarId)
        .then(function (res) {
          for(var i = 0; i < $scope.calendarList.items.length; i++) {
            if($scope.calendarList.items[i]._id === calendarId) {
              $scope.calendarList.items.splice(i, 1);
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
          $scope.calendarList.items.push(res.data);
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
          for(var i = 0; i < $scope.calendarList.items.length; i++) {
            if($scope.calendarList.items[i]._id === cal._id) {
              $scope.calendarList.items[i] = cal;
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
