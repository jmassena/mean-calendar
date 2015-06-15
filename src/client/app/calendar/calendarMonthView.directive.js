(function (angular) {
  'use strict';

  angular.module('app')
    .directive('calendarMonthView', calendarMonthView);

  calendarMonthView.$inject = ['$timeout', 'ModalSvc'];

  function calendarMonthView($timeout, ModalSvc) {

    // renders the calendar name, color, dropdown arrow for setting properties
    // emits events to communicate with calendar controller for setting color or deactivating calendar.
    return {
      restrict: 'E',
      templateUrl: './app/calendar/calendarMonthView.templ.html',
      scope: {
        monthViewEvents: '='
      },

      controller: function ($scope) {

          // $scope.delete = function (calendarId, calendarEventId) {
          //   // ModalSvc.open({
          //   //     bodyContent: 'Delete "' + calendar.title + '"?'
          //   //   })
          //   //   .result
          //   //   .then(function (okVal) {
          //   //     $scope.$emit('mycalendar.delete', calendar._id);
          //   //   }, function (cancelVal) {
          //   //     console.log('Cancelled modal val: ' + cancelVal);
          //   //   });
          // };

          $scope.create = function (calendarId) {
            // ModalSvc.open({
            //     bodyContent: 'Delete "' + calendar.title + '"?'
            //   })
            //   .result
            //   .then(function (okVal) {
            //     $scope.$emit('mycalendar.delete', calendar._id);
            //   }, function (cancelVal) {
            //     console.log('Cancelled modal val: ' + cancelVal);
            //   });
          };

          $scope.edit = function (calendarId, calendarEventId) {
            // ModalSvc.open({
            //     bodyContent: 'Delete "' + calendar.title + '"?'
            //   })
            //   .result
            //   .then(function (okVal) {
            //     $scope.$emit('mycalendar.delete', calendar._id);
            //   }, function (cancelVal) {
            //     console.log('Cancelled modal val: ' + cancelVal);
            //   });
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
