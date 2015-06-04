// src/server/test/e2e/todoSpec.js
'use strict';

/* global before */
/* global after */
/*jshint -W079 */
var expect = require('chai').expect;
var mongoose = require('mongoose');
var userDAL = require('../../data-access/user.js');
var testUtils = require('../../common/testUtils.js');
var dbUri = 'mongodb://localhost/login_test';

describe('User DAL', function () {

  var user;

  // open db connection if needed (if mocha stays active between runs then connection still exists)
  before(function (done) {
    testUtils.connect(mongoose, dbUri, done);
  });

  // clear any data from todo collection
  beforeEach(function (done) {
    userDAL.Model.remove({}).exec()
      .then(function () {
        done();
      }, done);
  });

  // insert test data
  beforeEach(function (done) {

    user = {
      userName: 'testUser',
      password: 'hellokitty',
      email: 'testuser@mail.com',
      firstName: 'test',
      lastName: 'user'
    };

    userDAL.create(user)
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
    testUtils.closeConnection(mongoose, done);
  });

  it('should create a new user', function (done) {

    var newUser = {
      userName: 'testUser2',
      password: 'hellokitty2',
      email: 'testuser2@mail.com',
      firstName: 'test2',
      lastName: 'user2'
    };

    userDAL.create(newUser)
      .then(function (data) {
        return userDAL.get({
          userName: newUser.userName
        });
      })
      .then(function (data) {
        expect(data).to.have.length(1);
        expect(data[0].userName).to.equal(newUser.userName);
        done();
      }, done);
  });

  it('should get a user by username', function (done) {
    userDAL.get({
        userName: user.userName
      })
      .then(function (data) {
        expect(data).to.have.length(1);
        expect(data[0].userName).to.equal(user.userName);
      })
      .then(function () {
        done();
      }, done);
  });

  it('should get a user by id', function (done) {
    userDAL.getById(user._id)
      .then(function (data) {
        expect(data).to.not.be.null;
        expect(data.userName).to.not.be.null;
        expect(data.userName).to.equal(user.userName);
        expect(data._id.equals(user._id)).to.be.true;
      })
      .then(function () {
        done();
      }, done);
  });

  it('should update a user', function (done) {
    var updateUser = {
      userName: 'newUserName',
      password: 'newPassword',
      email: 'newUser@mail.com',
      firstName: 'newFirstName',
      lastName: 'newLastName'
    };
    updateUser._id = user._id;

    userDAL.update(updateUser)
      .then(function (data) {
        return userDAL.Model.findOne({
          _id: user._id
        }).exec();
      })
      .then(function (data) {
        expect(data).to.not.be.null;
        // does not update password. we will have specific function for that
        // expect(data.password).to.equal(user.password);

        expect(data.userName).to.equal(updateUser.userName);
        expect(data.email).to.equal(updateUser.email.toLowerCase());
        expect(data.firstName).to.equal(updateUser.firstName);
        expect(data.lastName).to.equal(updateUser.lastName);
        expect(data._id.equals(updateUser._id)).to.be.true;
      })
      .then(function () {
        done();
      }, done);
  });

  it('should delete a user', function (done) {
    userDAL.deleteById(user._id)
      .then(function (data) {
        return userDAL.get({
          _id: user._id
        });
      })
      .then(function (data) {
        expect(data).length.to.be(0);
      })
      .then(function () {
        done();
      }, done);
  });

  it('should return 404 error if user not found when deleting by id', function (done) {
    var fakeId = '554b8b066d4e5b5c11aa0000';

    userDAL.deleteById(fakeId)
      .then(function (data) {
        expect('this should not be called').to.equal('');
      }, function (err) {
        expect(err.exceptionInfo).to.exist;
        expect(err.exceptionInfo.code).to.equal('user_not_found_for_id');
        expect(err.statusCode).to.equal(404); // not found
      })
      .then(function () {
        done();
      }, done);
  });

  it('should return 404 error if user not found when updating', function (done) {
    var fakeId = '554b8b066d4e5b5c11aa0000';
    user._id = fakeId;
    userDAL.update(user)
      .then(function (data) {
        expect('this should not be called').to.equal('');
      }, function (err) {
        expect(err.exceptionInfo).to.exist;
        expect(err.exceptionInfo.code).to.equal('user_not_found_for_id');
        expect(err.statusCode).to.equal(404); // not found
      })
      .then(function () {
        done();
      }, done);
  });

  it('should return 422 error if no _id set updating', function (done) {
    user._id = null;
    userDAL.update(user)
      .then(function (data) {
        expect('this should not be called').to.equal('');
      }, function (err) {
        expect(err.exceptionInfo).to.exist;
        expect(err.exceptionInfo.code).to.equal('cannot_update_object_with_null_id');
        expect(err.statusCode).to.equal(422); // not found
      })
      .then(function () {
        done();
      }, done);
  });

});
