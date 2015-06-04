(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('AuthSvc', AuthSvc);

  /*
   * service for
   * holding session info
   */
  AuthSvc.$inject = ['$cookies', '$q', '$http'];

  function AuthSvc($cookies, $q, $http) {

    var userUrl = '/api/users';
    var loginUrl = '/authenticate';

    var currentUser;

    var cookieToken = {
      set: function (token, durationMS) {

        durationMS = durationMS || (1000 * 60 * 30);
        var d = new Date();
        d.setMilliseconds(d.getMilliseconds() + durationMS);

        $cookies.put('token', token, {
          expires: d
        });
      },
      get: function () {
        return $cookies.get('token');
      },
      clear: function () {
        $cookies.remove('token');
      },
    };

    function getToken() {
      return cookieToken.get();
    }

    function login(userName, password) {
      return $http.post(loginUrl, {
          userName: userName,
          password: password
        })
        .then(function (res) {
            cookieToken.set(res.data.token);
          },
          function (res) {

            // NOTE: if you supply an error handler then you must either
            // throw an exception or return a rejected promise if you
            // want the error condition to persist. Otherwise the caller
            // will get the return value (if any) in their success handler.
            // and their error handler will not be called.
            clearUserAndToken();
            throw res; // this works!! :)
          });
    }

    function clearUserAndToken() {
      cookieToken.clear();
      currentUser = null;
    }

    function logout() {
      clearUserAndToken();
    }

    function isLoggedIn() {
      return cookieToken.get() != null;
    }

    function getCurrentUser() {

      // var deferred = $q.defer();

      if (!isLoggedIn()) {
        return $q.reject(new Error('User not logged in'));

      } else if (currentUser) {
        return $q.when(currentUser);

      } else {
        return getMe()
          .then(function (res) {
            currentUser = res.data;
            return currentUser;
          }, function (res) {
            clearUserAndToken();
            throw res;
          });
      }
    }

    function getMe() {
      return $http.get(userUrl + '/' + 'me');
    }

    return {
      login: login,
      logout: logout,
      isLoggedIn: isLoggedIn,
      getCurrentUser: getCurrentUser,
      getToken: getToken
    };

  }
})(this.angular);
