'use strict';

// /Users/justin/Documents/Dev/Ang/Todo/todo/protractor-conf.js
exports.config = {

  allScriptsTimeout: 11000,

  specs: [
    'src/client/test/e2e/*Spec.js'
    // ,{ pattern: 'src/client/test/data/todo.data.mock.js', included: false }
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  chromeOnly: true,
  baseUrl: 'http://localhost:3000/',
  framework: 'jasmine2',

  onPrepare: function () {
    var SpecReporter = require('jasmine-spec-reporter');
    // add jasmine spec reporter
    jasmine.getEnv().addReporter(new SpecReporter({
      displayStacktrace: true
    }));
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 10000,
    print: function () {}
  },

  seleniumAddress: null,
  seleniumServerJar: '/usr/local/lib/node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
  chromeDriver: '/usr/local/lib/node_modules/protractor/selenium/chromedriver'
};

// seleniumAddress: 'http://localhost:4444/wd/hub',
// seleniumAddress: 'http://localhost:4444/wd/hub',
//
