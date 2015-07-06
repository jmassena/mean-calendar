(function (angular) {
  'use strict';

  angular.module('app')
    .directive('calendarListItem', calendarListItem);

  calendarListItem.$inject = ['$timeout', '$modal', 'ModalSvc'];

  function calendarListItem($timeout, $modal, ModalSvc) {

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

        $scope.edit = function (calendar) {
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

        $scope.openEditDialog = function (calendar) {
          var modalInstance = $modal.open({
            animation: true,
            size: 'sm',
            scope: $scope,
            resolve: {
              calendar: function () {
                return calendar;
              }
            },

            templateUrl: './app/calendar/modal-new-calendar.templ.html',

            controller: function ($scope, $modalInstance, calendar) {

              $scope.editCalendar = angular.copy(calendar);

              $scope.submit = function () {
                if($scope.form.editCalendar.$valid) {

                  $scope.$emit('mycalendar.update', $scope.editCalendar);
                  $modalInstance.close();
                }
              };

              $scope.cancel = function () {
                $modalInstance.dismiss();
              };
            }
          });
        };
      }
    };
  }

}(this.angular));
