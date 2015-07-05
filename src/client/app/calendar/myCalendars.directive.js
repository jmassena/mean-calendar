(function (angular) {
  'use strict';

  angular.module('app')
    .directive('myCalendars', myCalendars);

  myCalendars.$inject = ['$timeout', '$document', '$modal'];

  function myCalendars($timeout, $document, $modal) {

    // renders the calendar name, color, dropdown arrow for setting properties
    // emits events to communicate with calendar controller for setting color or deactivating calendar.
    return {
      restrict: 'E',
      templateUrl: './app/calendar/myCalendars.templ.html',
      scope: {
        calendars: '='
      },

      controller: function ($scope, $modal) {

        // $scope.$watch(function () {
        //     return $scope.calendars;
        //   },
        //   function (newVal, oldVal) {
        //     if(newVal !== oldVal) {
        //       var x = 'test';
        //     }
        //   });

        $scope.openCreateDialog = function () {
          var modalInstance = $modal.open({
            animation: true,
            size: 'sm',
            scope: $scope,

            templateUrl: './app/calendar/modal-new-calendar.templ.html',

            controller: function ($scope, $modalInstance) {

              $scope.editCalendar = {};
              $scope.editCalendar.config = {};
              $scope.editCalendar.config.eventColor = '#7d8ec0';

              $scope.submit = function () {
                if($scope.form.editCalendar.$valid) {
                  $scope.$emit('mycalendar.create', $scope.editCalendar);
                  $modalInstance.close();
                }
              };

              $scope.cancel = function () {
                $modalInstance.dismiss();
              };
            }
          });
        };
      },
    };
  }

}(this.angular));
