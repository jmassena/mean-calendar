(function (angular) {
  'use strict';

  angular.module('app')
    .controller('RegistrationCtrl', RegistrationCtrl);

  RegistrationCtrl.$inject = ['$rootScope', '$state', '$timeout', 'UserSvc', 'AuthSvc', 'GlobalNotificationSvc',
    'NotificationSvc'
  ];

  function RegistrationCtrl($rootScope, $state, $timeout, UserSvc, AuthSvc, GlobalNotificationSvc,
    NotificationSvc) {

    $rootScope.title = 'Register';
    var vm = this;
    // properties
    vm.user = {};

    // functions
    vm.submitUser = submitUser;
    vm.notifications = new NotificationSvc();

    var test = true;
    // test = false;
    if(test) {
      vm.form = {};
      vm.form.userName = 'testUser1234';
      vm.form.password = 'testUser1234';
      vm.form.email = 'testUser1234@mail.com';
      vm.form.firstName = 'test';
      vm.form.lastName = 'user';
    }

    vm.localNotificationTest = localNotificationTest;
    vm.globalNotificationTest = globalNotificationTest;
    vm.globalNotificationClear = globalNotificationClear;
    vm.singleGlobalNotificationTest = singleGlobalNotificationTest;

    activate();

    function activate() {
      if(AuthSvc.isLoggedIn()) {
        $state.go('welcome');
      }
    }

    var num = 0;

    function globalNotificationClear() {
      GlobalNotificationSvc.clear();
    }

    function globalNotificationTest() {
      GlobalNotificationSvc.add({
        message: 'notification test #' + (++num),
        type: (num % 3 === 0) ? 'error' : 'success',
        mode: 'multiple',
        timeout: 5000
      });
    }

    function singleGlobalNotificationTest() {
      GlobalNotificationSvc.add({
        message: 'notification test #' + (++num),
        type: (num % 3 === 0) ? 'error' : 'success',
        mode: 'single',
        timeout: 3000
      });
    }

    function localNotificationTest() {
      vm.notifications.add({
        message: 'notification test #' + (++num),
        type: (num % 3 === 0) ? 'error' : 'success',
        mode: 'multiple'
      });
    }

    // functions for collecting form data and submitting new user info
    function submitUser(user) {
      GlobalNotificationSvc.clear();

      UserSvc.register(user)
        .then(function () {
            return AuthSvc.login(user.userName, user.password);
          },
          function (res) {

            var msg = 'Error creating user: ' + (res.data ? res.data.message : '');
            if(res.data.errors && res.data.errors.length > 0) {
              msg += ': \n' + res.data.errors.join('\n');
            }
            var formattedResponse = {
              data: {
                message: msg
              }
            };
            throw formattedResponse;
          })
        .then(function () {
            $state.go('welcome');
          },
          function (res) {
            console.error(res);
            GlobalNotificationSvc.addError(res.data.message);
          });
    }
  }
}(this.angular));
