'use strict';

/* global protractor */
/* global $$ */
var path = require('path');
var Q = require('q');
// var moment = require('moment');
var RegistrationPage = require('./registration.page.js');
var request = require('superagent');
var usersRootUri = 'localhost:3000/api/users';

// console.log(JSON.stringify(protractor));
var fakeUserId = '5536a74e354d000000000000';

var urlHelper = {
  login: function () {
    return 'localhost:3000/auth/local';
  },
  get: function (userId) {
    if(userId) {
      return path.join(usersRootUri, userId.toString());
    }
    return path.join(usersRootUri);
  },
  post: function () {
    return path.join(usersRootUri);
  },
  put: function (userId) {
    return path.join(usersRootUri, userId.toString());
  },
  delete: function (userId) {
    return path.join(usersRootUri, userId.toString());
  }
};

// function hasClass(element, cls) {
//   return element.getAttribute('class').then(function (classes) {
//     return classes.split(' ').indexOf(cls) !== -1;
//   });
// }

function create(user) {
  var deferred = Q.defer();
  request
    .post(urlHelper.post())
    .send(user)
    .end(function (err, res) {
      if(err) {
        console.log('error creating user');
        deferred.reject(err);
      } else {
        deferred.resolve(res);
      }
    });
  return deferred.promise;
}

// function login(user) {
//   var deferred = Q.defer();
//   request
//     .post(urlHelper.login())
//     .send({
//       userName: user.userName,
//       password: user.password
//     })
//     .end(function (err, res) {
//       if(err) {
//         console.log('error logging in');
//         // if(err.response.error) {
//         //   console.log(err.response.error);
//         // } else {
//         console.log(err);
//         // }
//         deferred.reject(err);
//       } else {
//         deferred.resolve(res);
//       }
//     });
//   return deferred.promise;
// }

function login(user) {
  var deferred = Q.defer();

  request
    .post(urlHelper.login())
    .send({
      userName: user.userName,
      password: user.password
    })
    .on('redirect', function (res) {
      var t = getTokenFromResponseHeader(res);
      if(t) {
        // console.log('resolving login token: ' + t);
        deferred.resolve(t);
      } else {
        console.log('rejecting login token: ' + t);
        deferred.reject(new Error('no token in res'));
      }
    })
    .end();
  // .end(function (err, res) {
  //   console.log('done with login');
  // });
  // .end(function (err, res) {
  //   // I always get a CONNECTONREFUSED error from this
  //   // even though the 'redirect' response is good above
  //   // This does not seem consistent with online examples of
  //   // handling redirects. They seem to not have this error
  //   // and get a res object with res.redirects array in this block.
  //   // return deferred.promise;
  // });
  return deferred.promise;
}

function getTokenFromResponseHeader(res) {

  var t = res.headers['set-cookie'];

  if(t && t.length > 0) {
    var tokenString = t[0].split(' ')[0];
    var match = tokenString.match(/token=([^;]+);/);
    if(match.length > 1) {
      return match[1];
    }
  }

  return null;
}

function getUsers(userId, token) {
  // console.log('getting users with token: ' + token);
  var deferred = Q.defer();
  request
    .get(urlHelper.get(userId))
    .set('Authorization', 'Bearer ' + token)
    .end(function (err, res) {
      if(err) {
        console.log('error getting user by id');
        deferred.reject(err);
      } else {
        deferred.resolve(res);
      }
    });
  return deferred.promise;
}

function deleteUser(userId, token) {
  var deferred = Q.defer();
  request
    .del(urlHelper.delete(userId))
    .set('Authorization', 'Bearer ' + token)
    .end(function (err, res) {
      if(err) {
        console.log('error deleting user: ' + userId);
        console.log(err);
        deferred.reject(err);
      } else {
        //console.log('deleted user: ' + userId);
        deferred.resolve(res);
      }
    });
  return deferred.promise;
}

// helper to log nasty superagent response if error occurred.
function logError(err) {
  if(err.response && err.response.res && err.response.res.body) {
    console.log(err.response.res.body);
  } else {
    console.log(err);
  }
}

describe('Registration form', function () {

  // get existing items
  var dbItems;
  var token;
  var startUsersCount = 0;

  var suffix = Math.floor(Math.random() * 1000);

  var tokenUser = {};
  tokenUser.userName = 'testUser' + suffix;
  tokenUser.password = 'password11';
  tokenUser.email = tokenUser.userName + '@mail.com';
  tokenUser.firstName = 'test';
  tokenUser.lastName = 'user';

  // create user so I can have a token
  beforeAll(function (done) {
    create(tokenUser)
      .then(function (res) {
        return login(tokenUser);
      })
      .then(function (data) {
        token = data;
        done();
      }, function (err) {
        logError(err);
        done(err);
      });
  });

  // delete all users except token user
  beforeEach(function (done) {
    getUsers(null, token)
      .then(function (res) {
        if(res.body.length > 0) {
          var promises = res.body
            .filter(function (item) {
              return item.userName !== tokenUser.userName;
            })
            .map(function (item) {
              return deleteUser(item._id, token);
            });

          return Q.all(promises);
        } else {
          var deferred = Q.defer();
          deferred.resolve(res);
          return deferred.promise;
        }
      })
      .then(function (res) {
        done();
      }, function (err) {
        logError(err);
        done(err);
      });
  });

  // log out user if logged in
  beforeEach(function (done) {
    browser.get('/#/register');

    $$('a[sref="logout"]').each(function (el, idx) {
        console.log(el);
        if(el && idx === 0) {
          el.click();
        }
      })
      .then(function () {
        done();
      });

  });

  var page;
  beforeEach(function () {
    page = new RegistrationPage();
    expect(browser.getCurrentUrl()).toMatch('register');
  });

  describe('Form validation', function () {

    it('should not have validation errors if all fields are valid', function () {

      page.formClear();
      page.userName = 'testUser11';
      page.password = 'password11';
      page.email = 'testuser11@mail.com';
      page.firstName = 'test';
      page.lastName = 'user';

      expect(element.all(by.css('#userForm.ng-invalid')).count()).toEqual(0);
    });

    it('should have validation errors if username field is too short', function () {

      page.formClear();
      page.userName = 'testUse'; // 7 chars
      page.password = 'password11';
      page.email = 'testuser11@mail.com';
      page.firstName = 'test';
      page.lastName = 'user';

      expect($$('#userForm.ng-invalid').count()).toEqual(1);

    });

    it('should have validation errors if password field is too short', function () {

      page.formClear();
      page.userName = 'testUser11';
      page.password = 'passwor'; // 7 chars
      page.email = 'testuser11@mail.com';
      page.firstName = 'test';
      page.lastName = 'user';

      expect($$('#userForm.ng-invalid').count()).toEqual(1);

    });

    it('should have validation errors if email field is invalid', function () {

      page.formClear();
      page.userName = 'testUser11';
      page.password = 'password11';
      page.firstName = 'test';
      page.lastName = 'user';

      page.email = 'testuser11mail.com';
      expect($$('#userForm.ng-invalid').count()).toEqual(1);

      page.email = 'testuser11@mailcom.';
      expect($$('#userForm.ng-invalid').count()).toEqual(1);

      page.email = '@testuser11mail.com';
      expect($$('#userForm.ng-invalid').count()).toEqual(1);

    });

    it('should have validation errors if firstName field is empty', function () {

      page.formClear();
      page.userName = 'testUser11';
      page.password = 'passwor'; // 7 chars
      page.email = 'testuser11@mail.com';
      // page.firstName = 'test';
      page.lastName = 'user';

      expect($$('#userForm.ng-invalid').count()).toEqual(1);

    });

    it('should have validation errors if lastName field is empty', function () {

      page.formClear();
      page.userName = 'testUser11';
      page.password = 'passwor'; // 7 chars
      page.email = 'testuser11@mail.com';
      page.firstName = 'test';
      // page.lastName = 'user';

      expect($$('#userForm.ng-invalid').count()).toEqual(1);
    });
  });

  describe('Successful registration', function () {

    it('should login and redirect to welcome screen', function () {

      page.formClear();
      page.userName = 'testUser22';
      page.password = 'password11';
      page.email = 'testuser11@mail.com';
      page.firstName = 'test';
      page.lastName = 'user';

      var displayName = 'test user';

      page.btnSubmit.click();

      browser.wait(function () {
          return browser.getCurrentUrl().then(function (url) {
            return /\/welcome$/.test(url);
          });
        }, 2000)
        .then(function () {
          expect(element(by.linkText(displayName)).isPresent()).toEqual(true);
          // expect($$('a[sref="logout"]').count()).toEqual(1);
          expect(element(by.linkText('Logout')).isPresent()).toEqual(true);
        });
    });
  });

  describe('duplicate user', function () {

    beforeEach(function (done) {
      var u = {};
      u.userName = 'testUser22';
      u.password = 'password11';
      u.email = 'testuser11@mail.com';
      u.firstName = 'test';
      u.lastName = 'user';

      create(u)
        .then(function () {
          done();
        }, function (err) {
          done(err);
        });
    });

    it('should show error popup when user submission fails because of duplicate username', function () {

      page.formClear();
      page.userName = 'testUser22';
      page.password = 'password11';
      page.email = 'testuser11@mail.com';
      page.firstName = 'test';
      page.lastName = 'user';

      page.btnSubmit.click();
      expect($$('notification[global="true"]>div>ul>li.notification-error').count()).toEqual(1);
    });
  });

});
