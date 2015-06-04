(function (angular) {
  'use strict';

  angular.module('app')
    .controller('WelcomeCtrl', WelcomeCtrl);

  WelcomeCtrl.$inject = ['AuthSvc'];

  function WelcomeCtrl(AuthSvc) {

    var vm = this;
    vm.user = null;

    activate();

    function activate() {

      var t = AuthSvc.getToken();

      if(AuthSvc.isLoggedIn()) {
        AuthSvc.getCurrentUser()
          .then(function (user) {
              vm.user = user;
            },
            function (res) {
              console.error(res);
            });
      }
    }
  }

}(this.angular));
