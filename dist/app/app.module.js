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

  authInterceptor.$inject = ['$q', '$window', '$injector', 'GlobalNotificationSvc'];

  function authInterceptor($q, $window, $injector, GlobalNotificationSvc) {
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

      responseError: function (res) {

        // TODO: need to distinguish between not authorized for resource and not authenticated.
        if(res.status === 401) {
          console.error('Not authorized: ');
          console.error(res);

          var AuthSvc;

          if(res.data.message === 'jwt expired') {
            AuthSvc = $injector.get('AuthSvc');
            AuthSvc.clearUserAndToken();

            GlobalNotificationSvc.addNextError('Session expired');

            $injector.get('$state').go('login');

          } else if(res.data.message === 'No authorization token was found') {
            AuthSvc = $injector.get('AuthSvc');
            AuthSvc.clearUserAndToken();

            $injector.get('$state').go('login');
          }
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
