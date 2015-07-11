(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('Calendars', CalendarsFactory);

  function CalendarsFactory() {

    function Calendars(list) {

      if(!list) {
        this.items = [];
      } else if(!list.length) {
        this.items = [list];
      } else {
        this.items = list.sort(function (a, b) {
          if(a.isDefault !== b.isDefault) {
            return b.isDefault - a.isDefault;
          }

          return a.title.localeCompare(b.title);
        });
      }
    }

    Calendars.prototype.getIds = function () {
      return this.items.map(function (calendar) {
        return calendar._id;
      });
    };

    return Calendars;

  }
})(this.angular);
