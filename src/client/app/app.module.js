(function (angular) {
  'use strict';

  angular
    .module('app', ['ui.router', 'ui.bootstrap', 'ngCookies']);

  angular.module('app')
    .factory('authInterceptor', authInterceptor);

  angular.module('app')
    .factory('noResponseInterceptor', noResponseInterceptor);

  angular.module('app')
    .config(interceptorConfig);

  angular.module('app')
    .run(run);

  run.$inject = ['$rootScope', '$state', 'GlobalNotificationSvc', 'AuthSvc'];

  function run($rootScope, $state, GlobalNotificationSvc, AuthSvc) {
    $rootScope.$on('$stateChangeSuccess', function () {
      GlobalNotificationSvc.setNextSignal(true);
    });

    // if user not logged in redirect to login page
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if(!AuthSvc.isLoggedIn() && ['login', 'register'].indexOf(toState.name) ===
        -1) {
        event.preventDefault();
        $state.go('login');
      }
    });
  }

  interceptorConfig.$inject = ['$httpProvider'];

  function interceptorConfig($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
    $httpProvider.interceptors.push('noResponseInterceptor');
  }

  authInterceptor.$inject = ['$q', '$window', '$injector'];

  function authInterceptor($q, $window, $injector) {
    return {
      request: function (config) {
        config.headers = config.headers || {};

        // inject manually otherwise get a circular dependency error:
        // Uncaught Error: [$injector:cdep] Circular dependency found:
        //    $http <- AuthSvc <- authInterceptor <- $http <- $templateRequest <- $compile
        // http://stackoverflow.com/questions/20647483/angularjs-injecting-service-into-a-http-interceptor-circular-dependency

        var AuthSvc = $injector.get('AuthSvc');

        var token = AuthSvc.getToken();
        if(token) {
          config.headers.Authorization = 'Bearer ' + token;
        } else {
          console.log('no token in request');
        }
        return config;
      },
      response: function (res) {
        if(res.status === 401) {
          // handle the case where the user is not authenticated
          console.error('Not authorized: ');
          console.error(res);
        }
        return res || $q.when(res);
      },
      responseError: function (res) {
        if(res.status === 401) {
          console.error('Not authorized: ');
          console.error(res);

          $injector.get('$state').go('login');
        }
        return $q.reject(res);
      }
    };
  }

  noResponseInterceptor.$inject = ['$q'];

  function noResponseInterceptor($q) {
    return {
      responseError: function (res) {
        if(res.status === 0 && res.data == null) {
          res.data = {};
          res.data.message = 'The site is not available right now.';
        }

        return $q.reject(res);
      }
    };
  }

})(this.angular);
