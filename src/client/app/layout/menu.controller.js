(function (angular) {
  'use strict';

  angular
    .module('app')
    .controller('MenuCtrl', MenuCtrl);

  MenuCtrl.$inject = ['AuthSvc'];

  function MenuCtrl(AuthSvc) {

    var vm = this;
    vm.user = null;

    vm.logout = logout;

    activate();

    function activate() {
      if(AuthSvc.isLoggedIn()) {
        AuthSvc.getCurrentUser()
          .then(function (user) {
              vm.user = user;
            },
            // TODO: service should return error object with code/message
            // basically services should abstract the http call and just return data, not the http response.
            function (res) {
              console.error(res);
            });
      }
    }

    function logout() {
      AuthSvc.logout();
      vm.user = null;
    }

  }

})(this.angular);
