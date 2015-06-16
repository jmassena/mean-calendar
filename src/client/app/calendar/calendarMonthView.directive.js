(function (angular) {
  'use strict';

  angular.module('app')
    .directive('calendarMonthView', calendarMonthView);

  calendarMonthView.$inject = ['$timeout', '$modal'];

  function calendarMonthView($timeout, $modal) {

    // renders the calendar name, color, dropdown arrow for setting properties
    // emits events to communicate with calendar controller for setting color or deactivating calendar.
    return {
      restrict: 'E',
      templateUrl: './app/calendar/calendarMonthView.templ.html',
      scope: {
        monthViewEvents: '=',
        calendarList: '='
      },

      controller: function ($scope) {

          $scope.openCreateDialog = function (dayDate) {
            var modalInstance = $modal.open({
              animation: true,
              size: 'sm',
              // resolve: {
              //   modalData: function () {
              //     return 'hello';
              //   }
              // },
              scope: $scope,

              templateUrl: './app/calendar/modal-new-calendar-event.templ.html',

              controller: function ($scope, $modalInstance) {

                $scope.newEvent = {};
                $scope.newEvent.calendar = null;
                $scope.newEvent.allDay = true;
                var d = dayDate ? new Date(dayDate) : new Date();
                $scope.newEvent.start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                $scope.newEvent.end = new Date($scope.newEvent.start);

                $scope.form = {};

                $scope.submit = function () {
                  if($scope.form.newEvent.$valid) {

                    var calendarEvent = {};
                    // calendarEvent.calendarId = $scope.newEvent.calendar._id;
                    calendarEvent.title = $scope.newEvent.title;
                    calendarEvent.notes = $scope.newEvent.notes;
                    calendarEvent.allDay = $scope.newEvent.allDay;
                    calendarEvent.start = $scope.newEvent.start;
                    calendarEvent.end = $scope.newEvent.end;

                    $scope.$emit('calendarEvent.create', $scope.newEvent.calendar._id, calendarEvent);
                    $modalInstance.close();
                  }
                };

                $scope.cancel = function () {
                  $modalInstance.dismiss();
                };
              }
            });
          };

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
