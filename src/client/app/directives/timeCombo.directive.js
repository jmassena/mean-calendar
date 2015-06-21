(function (angular) {
  'use strict';

  angular.module('app')
    .directive('timeCombo', timeCombo);

  timeCombo.$inject = ['$timeout', 'ModalSvc', 'UtilitySvc'];

  function timeCombo($timeout, ModalSvc, UtilitySvc) {

    // renders the calendar name, color, dropdown arrow for setting properties
    // emits events to communicate with calendar controller for setting color or deactivating calendar.

    var dir = {
      restrict: 'E',
      templateUrl: './app/directives/timeCombo.templ.html',
      scope: {
        dateTime: '=',
        minTime: '='
      },
      controllerAs: 'vm',
      bindToController: true,

      controller: function () {

        var vm = this;

        // build combo list
        vm.timesList = createTimeList(vm.minTime, vm.dateTime);

        if(vm.dateTime) {
          vm.selectedTimeString = dateToTimeString(vm.dateTime);
        }

        vm.setSelected = function (selectedDateTime) {
          updateModelDateTime(selectedDateTime, vm);
          var selectedTime = selectedDateTime.getTime();

          vm.timesList.forEach(function (item) {
            item.selected = item.value.getTime() === selectedTime;
          });
        };
      },

      link: function (scope, element, attrs) {

        var vm = scope.vm;

        // when minTime changes
        // update the dateTime if out of order
        // and recalc list if necessary
        scope.$watch(function () {
          return vm.minTime ? vm.minTime.getTime() : vm.minTime;
        }, function (newVal) {
          if(newVal) {
            if(vm.minTime > vm.dateTime) {
              // this will trigger the other watch to regenerate list if necessary
              vm.dateTime = new Date(vm.minTime);
              // vm.setSelected(vm.minTime);
            } else {
              vm.timesList = createTimeList(vm.minTime, vm.dateTime);
            }
          }
        });

        // when dateTime changes
        // check if we are or were on same date as minDate
        // and if so recalc list.
        scope.$watch(function () {
          return vm.dateTime ? vm.dateTime.getTime() : vm.dateTime;
        }, function (newVal, oldVal) {
          // if time date changed then recalculate list
          if(newVal) {
            // updateModelDateTime(vm.dateTime, vm);
            vm.selectedTimeString = dateToTimeString(vm.dateTime);
            vm.timesList = createTimeList(vm.minTime, vm.dateTime);
          }
        });

        element.find('input[type="text"]')
          .on('focus', function (evt) {
            $(this).on('keypress', function (evt) {
              if(evt.which === 13 || evt.which === 9) {
                updateModelFromTimeString($(this).val(), vm);
              }
            });
          })
          .on('blur', function (evt) {
            $(this).off('keypress');
            updateModelFromTimeString($(this).val(), vm);
          });

        element.find('.dropdown')
          .on('shown.bs.dropdown', function () {
            if(vm.selectedTimeString) {
              // to create an extension for this filter to match exact string.
              // $.expr[":"].containsExact = function (obj, index, meta, stack) {
              //   return (obj.textContent || obj.innerText || $(obj).text() || "") == meta[3];
              // };

              // $(this).find('.dropdown-menu li a').filter(function () {
              //     // list text must start with selectedTimeString
              //     // return $(this).text() === vm.selectedTimeString;
              //     return $(this).text().indexOf(vm.selectedTimeString) === 0;
              //
              //   })
              //   // want to scroll to the item but don't want focus set on it so set focus then blur.
              //   .focus().blur();

              // $(this).find('.dropdown-menu li.selected a').focus().blur();
              // // want to scroll to the item but don't want focus set on it so set focus then blur.
              //
              // $(this).find('.dropdown-menu li a').filter(function () {
              //     // list text must start with selectedTimeString
              //     return $(this).text().indexOf(vm.selectedTimeString) === 0;
              //   })
              //   // want to scroll to the item but don't want focus set on it so set focus then blur.
              //   .focus().blur();
              var selectedElement = $(this).find('.dropdown-menu li.selected');

              if(selectedElement.length > 0) {
                var firstElement = $(this).find('.dropdown-menu li:first');
                // $('.dropdown-menu')
                //   .animate({
                //     scrollTop: selectedElement.position().top - firstElement.position().top
                //   });

                $('.dropdown-menu')
                  .scrollTop(
                    selectedElement.position().top - firstElement.position().top
                  );
              }
            }
          });

        // element.find('.dropdown-menu')
        //   .on('click', 'li a', function (evt) {
        //     updateModelFromTimeString($(this).text(), vm);
        //     // scope.$digest();
        //   });

        // element.find('.dropdown-menu')
        //   .on('click', 'a', function (evt) {
        //     vm.selectedTimeString = $(this).text();
        //     // $(this).closest('.dropdown-menu').find('li.selected').removeClass('selected');
        //     // $(this).closest('li').addClass('selected');
        //   });
      }
    };

    return dir;

    function getStartOfDate(dt, addDays, addHours, addMinutes) {
      var ret = new Date(dt);
      if(addDays) {
        ret.setDate(ret.getDate() + addDays);
      }

      ret.setHours(addHours || 0);
      ret.setMinutes(addMinutes || 0);
      ret.setSeconds(0);
      ret.setMilliseconds(0);
      return ret;
    }

    // function getStartOfToday() {
    //   return getStartOfDate(new Date());
    // }

    function createTimeList(minTime, modelDateTime) {
      var timesList = [];

      var today = getStartOfDate(modelDateTime || minTime || new Date());

      var tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if(minTime && modelDateTime && getStartOfDate(minTime).getTime() === today.getTime()) {
        // if minTime is in same day as model date then set list start to min hours/minutes
        today.setHours(minTime.getHours());
        today.setMinutes(minTime.getMinutes());
      }

      var previousTime = today;
      while(today < tomorrow) {

        // TODO: show hours like '10:00am (2.5 hours)' and have 24 hour time range
        // add selected time to list if not in there already
        if(modelDateTime && previousTime < modelDateTime && modelDateTime < today) {
          timesList.push({
            text: dateToTimeString(modelDateTime),
            value: new Date(modelDateTime),
            selected: true
          });
        }

        timesList.push({
          text: dateToTimeString(today),
          value: new Date(today),
          selected: modelDateTime && today.getTime() === modelDateTime.getTime()
        });

        previousTime = new Date(today);
        today.setMinutes(today.getMinutes() + 30);
      }

      return timesList;
    }

    function updateModelDateTime(dt, vm) {
      if(dt) {
        // need to reassign date so any input[date] that shares the model will see the change
        vm.dateTime = new Date(dt);
        vm.selectedTimeString = dateToTimeString(dt);
      }
    }

    function updateModelFromTimeString(timeString, vm) {

      // parse time string;
      var time = timeStringParse(timeString);

      if(!time.invalid) {
        // need to reassign date so any input[date] that shares the model will see the change
        vm.dateTime = new Date(vm.dateTime);
        vm.dateTime.setHours(time.hours);
        vm.dateTime.setMinutes(time.minutes);
        vm.selectedTimeString = dateToTimeString(vm.dateTime);
      } else {
        // can we manually set the form element to invalid?
        var test = 'can we manually set the form element to invalid?';
      }
    }

    function timeStringParse(timeString) {
      /*jshint maxcomplexity:15*/
      var ret = {
        hours: 0,
        minutes: 0,
        invalid: false,
      };

      // validate with regex. This is complicated, have 4 or so cases. do it later
      // /^\s*\d{1,4}(am?)?||(pm?)?\s*/
      timeString = timeString.trim();

      // strip out am/pm string
      var pm = false;
      if(timeString.match(/pm?$/i)) {
        timeString = timeString.replace(/pm?$/i, '');
        timeString = timeString.trim();
        pm = true;
      }
      if(timeString.match(/am?$/i)) {
        timeString = timeString.replace(/am?$/i, '');
        timeString = timeString.trim();
      }

      // parse string.
      if(timeString.indexOf(':') > -1) {
        var splitTime = timeString.split(':');
        ret.hours = parseInt(splitTime[0], 10);
        ret.minutes = parseInt(splitTime[1]);
      } else {
        // no colon. test length of string.
        if(timeString.length === 4) {
          ret.hours = parseInt(timeString.substring(0, 2), 10);
          ret.minutes = parseInt(timeString.substring(2), 10);
        } else if(timeString.length === 3) {
          ret.hours = parseInt(timeString.substring(0, 1), 10);
          ret.minutes = parseInt(timeString.substring(1), 10);
        } else if(timeString.length === 2) {
          ret.minutes = parseInt(timeString, 10);
        } else if(timeString.length === 1) {
          ret.hours = parseInt(timeString, 10);
        } else {
          ret.invalid = true;
        }
      }

      var hoursOffset = 0;
      if(isNaN(ret.minutes)) {
        // set some error var
        ret.invalid = true;
      } else {
        ret.minutes = ret.minutes % 60;
        if(ret.minutes === 60) {
          ret.minutes = 0;
          hoursOffset = 1;
        }
      }

      if(isNaN(ret.hours)) {
        ret.invalid = true;
      } else {
        ret.hours += hoursOffset;
        ret.hours = ret.hours % 24;

        if(pm && ret.hours < 12) {
          ret.hours += 12;
        }
      }

      return ret;
    }

    function dateToTimeString(d) {
      var hours = d.getHours(),
        minutes = String(d.getMinutes()),
        amPm = 'am';

      if(hours >= 12) {
        amPm = 'pm';
      }

      if(hours === 0) {
        hours = 12;
      } else if(hours > 12) {
        hours -= 12;
      }

      if(minutes.length < 2) {
        minutes = '0' + minutes;
      }

      return hours + ':' + minutes + amPm;
    }
  }

}(this.angular));
