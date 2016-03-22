'use strict';

var express = require('express');
var MarkerController = require('./marker.controller');

var controller = new MarkerController();
var router = new express.Router();

//This function is needed because express is fucking with the class scope when calling the function
function callControllerMethod(method) {
  return function(req, res, next) {
    controller[method](req, res, next);
  }
}

//Delete a marker
router.delete('/:id', callControllerMethod('destroy'));
//Get all markers
router.get('/all', callControllerMethod('all'));
//Create a marker
router.post('/', callControllerMethod('create'));

module.exports = router;