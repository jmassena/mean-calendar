// routes.ui.index.js
'use strict';

var express = require('express');
var router = express.Router();
var path = require('path');
var config = require('../../config/environment');

/* GET index/welcome page. */
router.get('/', function (req, res, next) {

  var appHtmlPath;

  if(config.env === 'build' || config.env === 'pro') {
    appHtmlPath = path.join(__dirname, '../../../../dist/index.html');
  } else {
    appHtmlPath = path.join(__dirname, '../../../client/index.html');
  }

  res.sendFile(appHtmlPath);

});

module.exports = router;
