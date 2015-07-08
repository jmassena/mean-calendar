// routes/index.js
'use strict';
var config = require('../config/environment');
var errorRoutes = require('./errorRoutes.js');

module.exports = function (app, passport) {

  app.use('/', require('./auth.js')(passport));
  app.use('/', require('./ui/index.js'));

  app.use('/api/', require('./api/users.js'));
  app.use('/api/', require('./api/calendars.js'));
  app.use('/api/', require('./api/calendarEvents.js'));

  app.use('/', errorRoutes.notFoundHandler);
  app.use('/', errorRoutes.errorHandler);

};
