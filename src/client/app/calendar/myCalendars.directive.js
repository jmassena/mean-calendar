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
        calendarList: '='
      },

      controller: function ($scope, $modal) {

        $scope.openCreateDialog = function () {
          var modalInstance = $modal.open({
            animation: true,
            size: 'sm',
            // resolve: {
            //   modalData: function () {
            //     return 'hello';
            //   }
            // },
            scope: $scope,

            templateUrl: './app/calendar/modal-new-calendar.templ.html',

            controller: function ($scope, $modalInstance) {

              // $scope.form = {};

              $scope.submit = function () {
                if($scope.form.newCalendar.$valid) {
                  $scope.$emit('mycalendar.create', $scope.calendarTitle);
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
