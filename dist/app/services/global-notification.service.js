(function (angular) {
  'use strict';

  angular.module('app')
    .factory('GlobalNotificationSvc', GlobalNotificationSvc);

  GlobalNotificationSvc.$inject = ['NotificationSvc'];

  function GlobalNotificationSvc(NotificationSvc) {

    var n = new NotificationSvc();

    return n;

  }

}(this.angular));
