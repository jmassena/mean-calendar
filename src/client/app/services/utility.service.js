(function (angular) {
  'use strict';

  angular.module('app')
    .factory('UtilitySvc', UtilitySvc);

  UtilitySvc.$inject = [];

  function UtilitySvc() {

    var id = 0;

    return {
      guid: function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      },

      shortId: function () {
        return ++id % 10000;
      }
    };

    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
  }

}(this.angular));
