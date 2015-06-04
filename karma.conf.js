// Karma configuration
// Generated on Tue Apr 07 2015 15:31:55 GMT-0700 (PDT)

module.exports = function (config) {
  'use strict';

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      './bower_components/jquery/dist/jquery.js',

      // this causes an error and I don't need it but not sure why it errors?
      // Error: "Pattern "/bower_components/bootstrap/dist/js/bootstrap.js" does not match any file."
      // '/bower_components/bootstrap/dist/js/bootstrap.js', // not sure i need this

      './bower_components/angular/angular.js',
      './bower_components/angular-ui-router/release/angular-ui-router.js',
      './bower_components/angular-cookies/angular-cookies.js',

      './bower_components/angular-resource/angular-resource.js',
      './bower_components/angular-mocks/angular-mocks.js',
      './bower_components/moment/moment.js',

      './src/client/app/*.module.js', // need to load the module first
      './src/client/app/*.js',

      './src/client/test/data/**/*.js',
      './src/client/test/unit/**/*.js'
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      // include only source you want to cover, not test files
      './src/client/app/**/*.js': ['coverage']
    },

    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/'
    },
    // test results reporter to use
    // possible values: 'dots', 'progress', 'spec'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    //reporters: ['spec'],
    reporters: ['progress', 'coverage'],

    //plugins: ['karma-chrome-launcher', 'karma-jasmine', 'karma-spec-reporter'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
