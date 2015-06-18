(function (angular) {
  'use strict';

  angular.module('app')
    .directive('timeCombo', timeCombo);

  timeCombo.$inject = ['$timeout'];

  function timeCombo($timeout, ModalSvc) {

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
          var timesList = [];
          var tempDate = new Date();
          tempDate.setHours(0);
          tempDate.setMinutes(0);
          tempDate.setSeconds(0);
          tempDate.setMilliseconds(0);

          var tomorrow = new Date(tempDate);
          tomorrow.setDate(tomorrow.getDate() + 1);

          while(tempDate < tomorrow) {
            timesList.push(dateToTimeString(tempDate));
            tempDate.setMinutes(tempDate.getMinutes() + 30);
          }

          vm.timesList = timesList;

          if(vm.dateTime) {
            vm.selectedTimeString = dateToTimeString(vm.dateTime);
          }

        }
        // ,

      // link: function (scope, element, attrs) {
      //   element.find('#dropDownButton')
      //     .on('click', function (el) {
      //       element.find('#time-dropdown-menu').toggleClass('open');
      //     });
      // }

    };

    return dir;

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
