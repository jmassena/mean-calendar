// index.js
'use strict';

var _ = require('lodash');

var all = {

  env: process.env.NODE_ENV || 'dev',

  port: process.env.PORT || 3000,

  logLevel: process.env.NODE_LOG_LEVEL,

  mongoose: {}

}

_.merge(all, require('./' + 'secrets' + '.js'));
_.merge(all, require('./' + all.env + '.js'));

// console.log('config');
// console.log(all);
module.exports = all;
