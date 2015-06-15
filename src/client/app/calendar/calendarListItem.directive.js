(function (angular) {
  'use strict';

  angular.module('app')
    .directive('calendarListItem', calendarListItem);

  calendarListItem.$inject = ['$timeout', 'ModalSvc'];

  function calendarListItem($timeout, ModalSvc) {

    // renders the calendar name, color, dropdown arrow for setting properties
    // emits events to communicate with calendar controller for setting color or deactivating calendar.
    return {
      restrict: 'E',
      templateUrl: './app/calendar/calendarListItem.templ.html',
      scope: {
        calendar: '='
      },

      controller: function ($scope) {

          $scope.delete = function (calendar) {
            ModalSvc.open({
                bodyContent: 'Delete "' + calendar.title + '"?'
              })
              .result
              .then(function (okVal) {
                $scope.$emit('mycalendar.delete', calendar._id);
              }, function (cancelVal) {
                console.log('Cancelled modal val: ' + cancelVal);
              });
          };
        }
        // ,
        //
        // link: function (scope, element, attrs) {
        //
        // }

    };
  }

}(this.angular));
