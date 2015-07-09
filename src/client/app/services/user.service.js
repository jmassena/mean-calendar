(function (angular) {
  'use strict';

  angular
    .module('app')
    .factory('UserSvc', UserSvc);

  /*
   * service for
   * creating a new user
   * getting user info
   * authenticating a user
   * checking user authorization to resources
   */
  UserSvc.$inject = ['$http'];

  function UserSvc($http) {

    var userUrl = '/api/users';

    function register(user) {
      return $http.post(userUrl, user);
    }

    // function get(userId) {
    //   return $http.get(userUrl + '/' + userId);
    // }

    return {
      register: register
    };
  }
})(this.angular);
