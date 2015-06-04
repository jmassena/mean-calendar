'use strict';

module.exports = RegistrationPage;

function RegistrationPage() {

  browser.get('/#/register');
}

RegistrationPage.prototype = Object.create({}, {

  divMainContent: getByCss('div[ui-view="main-content"]'),
  form: getById('userForm'),

  userName: getSetById('userName'),
  password: getSetById('password'),
  email: getSetById('email'),
  firstName: getSetById('firstName'),
  lastName: getSetById('lastName'),

  btnSubmit: getById('btnSubmit')

});

RegistrationPage.prototype.formClear = function () {
  this.userName.clear();
  this.password.clear();
  this.email.clear();
  this.firstName.clear();
  this.lastName.clear();
};

function getSetById(id) {
  return {
    get: function () {
      return element(by.id(id));
    },
    set: function (val) {
      element(by.id(id)).sendKeys(val);
    }
  };
}

function getById(id) {
  return {
    get: function () {
      return element(by.id(id));
    }
  };
}

function getByCss(css) {
  return {
    get: function () {
      return $(css);
    }
  };
}

function getByButtonText(text) {
  return {
    get: function () {
      return element(by.buttonText(text));
    }
  };
}
