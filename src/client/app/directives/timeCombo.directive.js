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
        dateTime: '='
      },
      controllerAs: 'vm',
      bindToController: true,

      controller: function () {

        var vm = this;

        // build combo list
        var timesList = [];
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);

        var tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        while(today < tomorrow) {
          timesList.push(dateToTimeString(today));
          today.setMinutes(today.getMinutes() + 30);
        }

        vm.timesList = timesList;

        if(vm.dateTime) {
          vm.selectedTimeString = dateToTimeString(vm.dateTime);
        } else {
          vm.dateTime = new Date(today);
          vm.dateTime.setHours(10);
          vm.selectedTimeString = dateToTimeString(vm.dateTime);
        }

        // vm.setSelected = function ($event, timeString) {
        //   vm.selectedTimeString = timeString;
        //   element.find('.dropdown')
        // }
      },

      link: function (scope, element, attrs) {

        var vm = scope.vm;
        // add blur, enter/tab listeners when textbox has focus

        element.find('input[type="text"]')
          .on('focus', function (evt) {
            $(this).on('keypress', function (evt) {
              if(evt.which === 13 || evt.which === 9) {
                updateModelTime(this, vm);
              }
            });
          })
          .on('blur', function (evt) {
            $(this).off('keypress');
            updateModelTime(this, vm);
          });

        element.find('.dropdown')
          .on('shown.bs.dropdown', function () {
            if(vm.selectedTimeString) {
              // to create an extension for this filter to match exact string.
              // $.expr[":"].containsExact = function (obj, index, meta, stack) {
              //   return (obj.textContent || obj.innerText || $(obj).text() || "") == meta[3];
              // };

              $(this).find('.dropdown-menu li a').filter(function () {
                  return $(this).text() === vm.selectedTimeString;
                })
                // want to scroll to the item but don't want focus set on it.
                .focus().blur();
            }
          });

        // element.find('.dropdown-menu')
        //   .on('click', 'a', function (evt) {
        //     vm.selectedTimeString = $(this).text();
        //     // $(this).closest('.dropdown-menu').find('li.selected').removeClass('selected');
        //     // $(this).closest('li').addClass('selected');
        //   });
      }
    };

    return dir;

    function updateModelTime(el, vm) {
      var timeString = $(el).val();

      // parse time string;
      var time = timeStringParse(timeString);

      if(!time.invalid) {
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
