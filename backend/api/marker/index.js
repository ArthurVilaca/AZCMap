'use strict';

var express = require('express');
var controller = require('./marker.controller');
var router = new express.Router();

//Delete a marker
router.delete('/:id', controller.destroy);
//Get all markers
router.get('/all', controller.all);
//Create a marker
router.post('/', controller.create);

module.exports = router;