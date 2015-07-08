'use strict';

var express = require('express');
var controller = require('./users.js');
var auth = require('../../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.list);
router.get('/me', auth.isAuthenticated(), controller.getMe);
router.get('/:userId', auth.isAuthenticated(), controller.get);
router.post('/', controller.post);
router.put('/:userId', auth.isAuthenticated(), controller.put);
router.delete('/:userId', auth.isAuthenticated(), controller.delete);

module.exports = router;
