(function (angular) {
  'use strict';

  angular.module('app')
    .directive('autoFocus', autoFocus);

  autoFocus.inject = ['$timeout'];

  function autoFocus($timeout) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        $timeout(function () {
          // element.focus();
          element.find('input:visible:first').focus();
        });

      }
    };
  }
}(angular));
