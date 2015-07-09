(function (angular) {
  'use strict';

  angular.module('app')
    .controller('WelcomeCtrl', WelcomeCtrl);

  WelcomeCtrl.$inject = ['AuthSvc', '$state'];

  function WelcomeCtrl(AuthSvc, $state) {

    var vm = this;
    vm.user = null;

    activate();

    function activate() {

      var t = AuthSvc.getToken();

      if(AuthSvc.isLoggedIn()) {

        // AuthSvc.getCurrentUser()
        //   .then(function (user) {
        //       vm.user = user;
        //     },
        //     function (res) {
        //       console.error(res);
        //     });

        $state.go('calendar');

      }
    }
  }

}(this.angular));
