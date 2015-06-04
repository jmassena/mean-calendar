// src/server/test/e2e/todo.route.spec.js
'use strict';

/* global before */
/* global after */

process.env.NODE_ENV = 'test';
process.env.NODE_LOG_LEVEL = 'none';

var mongoose = require('mongoose');
var request = require('supertest');
/*jshint -W079 */
var expect = require('chai').expect;
var path = require('path');

var testUtils = require('../../common/testUtils.js');
var userDAL = require('../../data-access/user.js');
var auth = require('../../auth/auth.service.js');

var app = require('../../app.js');

var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var dbUri = 'mongodb://localhost/login_test';
var usersRootUri = '/api/users';
var fakeUserId = '5536a74e354d000000000000';

var urlHelper = {
  login: function (user) {
    return '/auth/local';
  },
  getMe: function () {
    return path.join(usersRootUri, 'me');
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

describe('User route', function () {

  // open db connection if needed (if mocha stays active between runs then connection still exists)
  before(function (done) {
    testUtils.connect(mongoose, dbUri, done);
  });

  // clear any data from todo collection
  beforeEach(function (done) {
    userDAL.Model.remove({}, function (err) {
      done(err);
    });
  });

  // insert test user and get token for him
  var user;
  var token;
  beforeEach(function (done) {
    // console.log('before each running');
    user = {
      userName: 'testUser',
      password: 'hellokitty',
      email: 'testuser@mail.com',
      firstName: 'test',
      lastName: 'user'
    };

    userDAL.create(user)
      .then(function (user) {
        return auth.signToken(user._id);
      }, function (err) {

        console.log('before each user save error');
        throw err;
      })
      .then(function (data) {
        token = data;

        // console.log('data: ' + data);
        // console.log('token: ' + token);
      })
      .then(function (data) {
        return userDAL.get({
          userName: user.userName
        });
      })
      .then(function (data) {
        expect(data).to.have.length(1);
        user._id = data[0]._id;
      })
      .then(function () {
        done();
      }, done);
  });

  after(function (done) {
    console.log('closing connection');
    testUtils.closeConnection(mongoose, done);
  });

  describe('POST /users', function () {
    it('should create a user without passing token', function (done) {

      var newUser = {
        userName: 'testUser2',
        password: 'hellokitty2',
        email: 'testuser2@mail.com',
        firstName: 'test2',
        lastName: 'user2'
      };

      request(app)
        .post(urlHelper.post())
        .send(newUser)
        .expect(201)
        .end(function (err, res) {
          expect(res.header.location).to.equal(path.join(usersRootUri, res.body._id));
          expect(res.body.userName).to.equal(newUser.userName);
          expect(res.body._id).to.not.be.null;
          done();
        });
    });

    it('should create a user with passing token', function (done) {

      var newUser = {
        userName: 'testUser2',
        password: 'hellokitty2',
        email: 'testuser2@mail.com',
        firstName: 'test2',
        lastName: 'user2'
      };

      request(app)
        .post(urlHelper.post())
        .set('Authorization', 'Bearer ' + token)
        .send(newUser)
        .expect(201)
        .end(function (err, res) {
          expect(res.header.location).to.equal(path.join(usersRootUri, res.body._id));
          expect(res.body.userName).to.equal(newUser.userName);
          expect(res.body._id).to.not.be.null;
          done();
        });
    });

    it('should return 422 error if no user object sent', function (done) {
      request(app)
        .post(urlHelper.post())
        .set('Authorization', 'Bearer ' + token)
        .send()
        .expect(422)
        .end(function (err, res) {
          console.log(err);
          expect(res.body.message).to.have.string('Validation failed');
          done();
        });
    });

    it('should return error if user property is invalid', function (done) {

      var newUser = {
        userName: '1234567', // only 7 chars
        password: 'hellokitty2',
        email: 'testuser2@mail.com',
        firstName: 'test2',
        lastName: 'user2'
      };

      request(app)
        .post(urlHelper.post())
        .set('Authorization', 'Bearer ' + token)
        .send(newUser)
        .expect(422)
        .end(function (err, res) {
          expect(res.body.message).to.have.string(
            'userName (' + newUser.userName + ') ' + 'is shorter than the minimum allowed length');
          done();
        });
    });
  });

  describe('GET /users', function () {
    it('should get all users', function (done) {
      // add 1 user then get should return 2 users
      var newUser = {
        userName: 'testUser2',
        password: 'hellokitty2',
        email: 'testuser2@mail.com',
        firstName: 'test2',
        lastName: 'user2'
      };

      // should be able to post new user without token
      request(app)
        .post(urlHelper.post())
        .set('Authorization', 'Bearer ' + token)
        //.set('Authorization', token)
        .send(newUser)
        .expect(201)
        .end(function (err, res) {
          request(app)
            .get(urlHelper.get())
            .set('Authorization', 'Bearer ' + token)
            .send()
            .expect(200)
            .end(function (err, res) {
              expect(res.body.length).to.equal(2);
              done();
            });
        });
    });
  });

  describe('GET /users/:userId', function () {
    it('should get a single user', function (done) {
      request(app)
        .get(urlHelper.get(user._id))
        .set('Authorization', 'Bearer ' + token)
        .send()
        .expect(200)
        .end(function (err, res) {
          expect(res).to.not.be.null;
          expect(res.body._id).to.equal(user._id.toString());
          done();
        });
    });

    it('should return 401 error if no token supplied', function (done) {
      request(app)
        .get(urlHelper.get(user._id))
        .send()
        .expect(401)
        .end(function (err, res) {
          done();
        });
    });

    it('should return 404 if user not found', function (done) {
      request(app)
        .get(urlHelper.get(fakeUserId))
        .set('Authorization', 'Bearer ' + token)
        .send()
        .expect(404)
        .end(function (err, res) {
          expect(res.body.message).to.equal('User not found');
          done();
        });
    });

  });

  describe('GET /users/me', function () {
    it('should get current user', function (done) {
      request(app)
        .get(urlHelper.getMe())
        .set('Authorization', 'Bearer ' + token)
        .send()
        .expect(200)
        .end(function (err, res) {
          expect(res).to.not.be.null;
          expect(res.body._id).to.equal(user._id.toString());
          done();
        });
    });

    it('should return 404 if user not found', function (done) {
      request(app)
        .get(urlHelper.get(fakeUserId))
        .set('Authorization', 'Bearer ' + token)
        .send()
        .expect(204)
        .end(function (err, res) {
          expect(res.body).to.not.be.null;
          expect(res.body.message).to.equal('User not found');
          done();
        });
    });
  });

  describe('DELETE /users/:userId', function () {
    it('should delete a user', function (done) {
      request(app)
        .delete(urlHelper.delete(user._id))
        .set('Authorization', 'Bearer ' + token)
        .send()
        .expect(204)
        .end(function (err, res) {
          request(app)
            .get(urlHelper.get(user._id))
            .set('Authorization', 'Bearer ' + token)
            .send()
            .expect(404)
            .end(function (err, res) {
              done();
            });
        });
    });

    it('should return 404 if user not found', function (done) {
      request(app)
        .delete(urlHelper.delete(fakeUserId))
        .set('Authorization', 'Bearer ' + token)
        .send()
        .expect(404)
        .end(function (err, res) {
          expect(res.status).to.equal(404); //404 not found
          done();
        });
    });
  });

  describe('PUT /users/:userId', function () {
    it('should update a user', function (done) {

      var updateUser = {
        userName: 'testUser2',
        password: 'hellokitty2',
        email: 'testuser2@mail.com',
        firstName: 'test2',
        lastName: 'user2'
      };

      request(app)
        .put(urlHelper.put(user._id))
        .set('Authorization', 'Bearer ' + token)
        .send(updateUser)
        .expect(200)
        .end(function (err, res) {
          if(err) {
            return done(err);
          }
          request(app)
            .get(urlHelper.get(user._id))
            .set('Authorization', 'Bearer ' + token)
            .send()
            .expect(200)
            .end(function (err, res) {
              expect(res.body._id.toString()).to.equal(user._id.toString());
              expect(res.body.userName).to.equal(updateUser.userName);
              expect(res.body.email).to.equal(updateUser.email);
              expect(res.body.firstName).to.equal(updateUser.firstName);
              expect(res.body.lastName).to.equal(updateUser.lastName);

              if(err) {
                return done(err);
              }
              done();
            });
        });

    });

    it('should return 422 error if user object id differs from url user id', function (done) {
      request(app)
        .put(urlHelper.put(fakeUserId))
        .set('Authorization', 'Bearer ' + token)
        .send(user)
        .expect(422)
        .end(function (err, res) {
          expect(res.body.message).to.equal('Error occurred'); //422 Unprocessable Entity
          done();
        });
    });

    it('should return 404 if user not found', function (done) {
      user._id = fakeUserId;
      request(app)
        .put(urlHelper.put(fakeUserId))
        .set('Authorization', 'Bearer ' + token)
        .send(user)
        .expect(404)
        .end(function (err, res) {
          done();
        });
    });
  });
});
