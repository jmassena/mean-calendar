(function (angular) {
  'use strict';

  angular.module('app')
    .controller('LoginCtrl', LoginCtrl);

  LoginCtrl.$inject = ['$rootScope', '$state', 'AuthSvc', 'GlobalNotificationSvc', '$timeout', '$window'];

  function LoginCtrl($rootScope, $state, AuthSvc, GlobalNotificationSvc, $timeout, $window) {

    var vm = this;
    // properties
    vm.form = {
      userName: null,
      password: null
    };

    // functions
    vm.login = login;
    vm.loginProvider = loginProvider;

    activate();

    function activate() {
      if(AuthSvc.isLoggedIn()) {
        $state.go('welcome');
      }
    }

    function login(user) {
      AuthSvc.login(user.userName, user.password)
        .then(redirectAfterLogin, loginFailureNotify);
    }

    function loginProvider(provider) {
      $window.location.href = '/auth/' + provider;
    }

    function loginFailureNotify(res) {
      GlobalNotificationSvc.add({
        message: res.data.message,
        type: 'error',
        mode: 'single'
      });
    }

    function redirectAfterLogin() {
      $state.go('welcome');
      GlobalNotificationSvc.add({
        message: 'Login Successful',
        type: 'success',
        nextState: true,
        timeout: 2000
      });
    }

  }
}(this.angular));
