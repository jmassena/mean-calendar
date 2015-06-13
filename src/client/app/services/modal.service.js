(function (angular) {
  'use strict';

  angular.module('app')
    .factory('ModalSvc', ModalSvc);

  ModalSvc.$inject = ['$modal'];

  function ModalSvc($modal) {

    var defaultConfig = {
      animation: true,
      size: 'sm',
      resolve: null,
      scope: {},
      // controller: null,
      title: 'Confirmation',
      bodyContent: 'Are you sure?'
    };

    var html = '' +
      '    <div class="modal-content">' +
      '      <div class="modal-header">' +
      '        <button type="button" class="close" ng-click="cancel()" aria-label="Close">' +
      '          <span aria-hidden="true">&times;</span>' +
      '        </button>' +
      '        <h4 class="modal-title">{{modalData.title}}</h4>' +
      '      </div>' +
      '      <div class="modal-body">' +
      '        <p>{{modalData.bodyContent}}</p>' +
      '      </div>' +
      '      <div class="modal-footer">' +
      '        <button type="button" class="btn btn-default" ng-click="cancel()">No</button>' +
      '        <button type="button" class="btn btn-primary" ng-click="ok()">Yes</button>' +
      '      </div>' +
      '    </div>';

    function open(config) {

      config = angular.merge({}, defaultConfig, config);

      var resolve = {
        modalData: function () {
          return {
            title: config.title,
            bodyContent: config.bodyContent
          };
        }
      };

      var modalInstance = $modal.open({
        animation: config.animation,
        size: config.size,
        // scope: modalData,
        template: html,
        resolve: resolve,
        controller: function ($scope, $modalInstance, modalData) {

          $scope.modalData = modalData;
          $scope.ok = function () {
            $modalInstance.close('ok');
          };
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        }
      });

      return modalInstance;
    }

    return {
      open: open
    };
  }

}(this.angular));
