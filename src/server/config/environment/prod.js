// prod.js
'use strict';
var mongoUriUtil = require('mongodb-uri');

if(!process.env.MONGOLAB_URI) {
  throw new Error('MONGOLAB_URI environment variable must be set for production site');
}

module.exports = {
  mongoose: {
    dbName: 'login',
    mongoUri: mongoUriUtil.formatMongoose(process.env.MONGOLAB_URI)
  }
};
