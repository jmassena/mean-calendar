(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('AuthSvc', AuthSvc);

  /*
   * service for
   * holding session info
   */
  AuthSvc.$inject = ['$cookies', '$q', '$http', '$timeout'];

  function AuthSvc($cookies, $q, $http, $timeout) {

    var userUrl = '/api/users';
    var loginUrl = '/auth/local';

    var currentUser;

    // var cookieToken = {
    //   set: function (token, durationMS) {
    //
    //     durationMS = durationMS || (1000 * 60 * 30);
    //     var d = new Date();
    //     d.setMilliseconds(d.getMilliseconds() + durationMS);
    //
    //     $cookies.put('token', token, {
    //       expires: d
    //     });
    //   },
    //   get: function () {
    //     var token = $cookies.get('token');
    //     if(token) {
    //       console.log('token found');
    //     } else {
    //       console.log('token not found');
    //     }
    //     return token;
    //   },
    //   clear: function () {
    //     $cookies.remove('token');
    //   },
    // };

    function getToken() {
      var t = $cookies.get('token');
      return t;
    }

    function clearToken() {
      var t = $cookies.remove('token');
      return t;
    }

    function login(userName, password) {
      return $http.post(loginUrl, {
          userName: userName,
          password: password
        })
        .catch(function (res) {
          clearUserAndToken();
          throw res;
        });
    }

    function loginProvider(provider) {
      return $http.get('/auth/' + provider);
    }

    function clearUserAndToken() {
      clearToken();
      currentUser = null;
    }

    function logout() {
      clearUserAndToken();
    }

    function isLoggedIn() {
      var t = getToken();
      return t != null;
    }

    function getCurrentUser() {

      // var deferred = $q.defer();

      if(!isLoggedIn()) {
        return $q.reject(new Error('User not logged in'));

      } else if(currentUser) {
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
      loginProvider: loginProvider,
      logout: logout,
      isLoggedIn: isLoggedIn,
      getCurrentUser: getCurrentUser,
      getToken: getToken
    };

  }
})(this.angular);
