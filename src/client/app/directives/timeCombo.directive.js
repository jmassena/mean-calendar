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
        time: '=',
        minTime: '=',
        defaultTime: '='
      },
      controllerAs: 'vm',
      bindToController: true,

      controller: function () {

        var vm = this;

        if(!vm.time) {
          vm.time = angular.copy(vm.defaultTime);
        }
        // build initial combo list
        vm.timesList = createTimeList(vm.minTime, vm.time);

        if(vm.time) {
          vm.selectedTimeString = timeToDisplayString(vm.time);
        }

        vm.setSelected = function (time) {
          updateModelTime(time, vm);

          vm.timesList.forEach(function (item) {
            item.selected = item.value.hours === time.hours && item.value.minutes === time.minutes;
          });
        };
      },

      link: function (scope, element, attrs) {

        var vm = scope.vm;
        // vm.time
        scope.$watch(function () {
            return vm.time ? vm.time.hours + ':' + vm.time.minutes : null;
          },
          function (newVal, oldVal) {
            if(newVal && newVal !== oldVal) {
              vm.selectedTimeString = timeToDisplayString(vm.time);
            }
          });

        // vm.minTime
        scope.$watch(function () {
            return vm.minTime ? vm.minTime.hours + ':' + vm.minTime.minutes : null;
          },
          function (newVal, oldVal) {
            if(newVal !== oldVal) {
              vm.timesList = createTimeList(vm.minTime, vm.time);
            }
          });

        // convert textbox input to time
        element.find('input[type="text"]')
          .on('focus', function (evt) {

            $(this).on('keypress', function (evt) {
              if(evt.which === 13 || evt.which === 9) {
                updateModelTimeFromString($(this).val(), vm);
              }
            });
          })
          .on('blur', function (evt) {

            $(this).off('keypress');

            var inputVal = $(this).val();
            if(inputVal !== vm.selectedTimeString) {
              updateModelTimeFromString($(this).val(), vm);
            }
          });

        // scroll to selected element when combo opened
        element.find('.dropdown')
          .on('shown.bs.dropdown', function () {

            if(vm.selectedTimeString) {
              var selectedElement = $(this).find('.dropdown-menu li.selected');

              if(selectedElement.length > 0) {
                var firstElement = $(this).find('.dropdown-menu li:first');

                $('.dropdown-menu')
                  .scrollTop(selectedElement.position().top - firstElement.position().top);
              }
            }
          });
      }
    };

    return dir;

    function timeAsNumberGet(time) {
      if(!time) {
        return null;
      }

      return Number(time.hours) * 100 + Number(time.minutes);
    }

    function createTimeList(minTime, modelTime) {
      var timesList = [];

      if(!minTime) {
        minTime = {
          hours: 0,
          minutes: 0
        };
      }

      var modelTimeValue = timeAsNumberGet(modelTime);
      var previousTimeValue = timeAsNumberGet(minTime);
      var currentTime = minTime;

      // TODO: show hours like '10:00am (2.5 hours)' and have 24 hour time range
      for(var i = 0; i < 48; i++) {

        var currentTimeValue = timeAsNumberGet(currentTime);

        if(modelTime && previousTimeValue < modelTimeValue && modelTimeValue < currentTimeValue) {
          timesList.push({
            text: timeToDisplayString(modelTime),
            value: modelTime,
            selected: true
          });
        }

        timesList.push({
          text: timeToDisplayString(currentTime),
          value: currentTime,
          selected: modelTime && currentTimeValue === modelTimeValue
        });

        previousTimeValue = currentTimeValue;

        // increment time by 30 minutes
        currentTime = angular.copy(currentTime);
        currentTime.minutes += 30;
        if(currentTime.minutes > 59) {
          currentTime.minutes %= 60;
          currentTime.hours++;
        }
      }

      return timesList;
    }

    function updateModelTime(time, vm) {
      if(time) {
        // need to reassign date so any input[date] that shares the model will see the change
        vm.time = time;
        vm.selectedTimeString = timeToDisplayString(time);
      }
    }

    function updateModelTimeFromString(timeString, vm) {

      // parse time string;
      var time = timeStringParse(timeString);

      if(!time.invalid) {
        updateModelTime(time, vm);
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

    function timeToDisplayString(time) {
      var hours = time.hours,
        minutes = time.minutes,
        amPm = 'am';

      if(hours >= 12) {
        amPm = 'pm';
      }

      if(hours === 0) {
        hours = 12;
      } else if(hours > 12) {
        hours -= 12;
      }

      if(String(minutes).length < 2) {
        minutes = '0' + minutes;
      }

      return hours + ':' + minutes + amPm;
    }
  }

}(this.angular));
