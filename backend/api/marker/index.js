'use strict';

var express = require('express');
var MarkerController = require('./marker.controller');

var controller = new MarkerController();
var router = new express.Router();

//Delete a marker
router.delete('/:id', controller.destroy.bind(controller));
//Get all markers
router.get('/all', controller.all.bind(controller));
//Create a marker
router.post('/', controller.create.bind(controller));

module.exports = router;