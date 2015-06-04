(function (angular) {
  'use strict';

  angular
    .module('app')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/welcome');

    // TODO: top-nav is static so I think I can specify template on the directive
    // and then specify controller on template and then not keep giving for each route.
    $stateProvider
      .state('welcome', {
        url: '/welcome',
        views: {
          'top-nav': {
            templateUrl: 'app/layout/top-nav.html',
            controller: 'MenuCtrl',
            controllerAs: 'vm'
          },
          'main-content': {
            templateUrl: 'app/welcome.html',
            controller: 'WelcomeCtrl',
            controllerAs: 'vm'
          }
        }
      })
      .state('login', {
        url: '/login',
        views: {
          'top-nav': {
            templateUrl: 'app/layout/top-nav.html',
            controller: 'MenuCtrl',
            controllerAs: 'vm'
          },
          'main-content': {
            templateUrl: 'app/login.html',
            controller: 'LoginCtrl',
            controllerAs: 'vm'
          }
        }
      })
      .state('register', {
        url: '/register',
        views: {
          'top-nav': {
            templateUrl: 'app/layout/top-nav.html',
            controller: 'MenuCtrl',
            controllerAs: 'vm'
          },
          'main-content': {
            templateUrl: 'app/registration.html',
            controller: 'RegistrationCtrl',
            controllerAs: 'vm'
          }
        }
      });
  }
})(this.angular);
