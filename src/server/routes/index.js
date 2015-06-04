// routes/index.js
'use strict';
var config = require('../config/environment');

module.exports = function (app, passport) {

  app.use('/', require('./auth.js')(passport));
  app.use('/', require('./ui/index.js'));
  app.use('/api/', require('./api/users.js'));

  var errorRoutes = require('./errorRoutes.js');
  app.use('/', errorRoutes.notFoundHandler);
  app.use('/', errorRoutes.errorHandler);

};
