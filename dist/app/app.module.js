(function (angular) {
  'use strict';

  angular
    .module('app', ['ui.router', 'ngCookies']);

  angular.module('app')
    .factory('authInterceptor', authInterceptor);

  angular.module('app')
    .factory('errorInterceptor', errorInterceptor);

  angular.module('app')
    .config(interceptorConfig);

  angular.module('app')
    .run(run);

  run.$inject = ['$rootScope', 'GlobalNotificationSvc'];

  function run($rootScope, GlobalNotificationSvc) {
    $rootScope.$on('$stateChangeSuccess', function () {
      GlobalNotificationSvc.setNextSignal(true);
    });
  }

  interceptorConfig.$inject = ['$httpProvider'];

  function interceptorConfig($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
    $httpProvider.interceptors.push('errorInterceptor');
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
        if(AuthSvc.isLoggedIn()) {
          // console.log('requesting with token');
          config.headers.Authorization = 'Bearer ' + AuthSvc.getToken();
        }
        //  else {
        //   // console.log('requesting without token');
        // }
        return config;
      },
      response: function (response) {
        if(response.status === 401) {
          // handle the case where the user is not authenticated
          console.error('Not authorized: ');
          console.error(response);
        }
        return response || $q.when(response);
      }
    };
  }

  errorInterceptor.$inject = ['$q'];

  function errorInterceptor($q) {
    return {
      responseError: function (res) {
        console.log(res);
        if(res.status === 0 && res.data == null) {
          res.data = {};
          res.data.message = 'The site is not available right now.';
        }

        return $q.reject(res);
      }
    };
  }

})(this.angular);
