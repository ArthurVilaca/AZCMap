'use strict';

var Marker = require('./marker.model');

//Use this to logic validation errors
function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

//Use this to handle errors (in catches)
function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function respondWith(res, statusCode) {
  statusCode = statusCode || 200;
  return function() {
    res.status(statusCode).end();
  };
}

/**
 * Creates a new Marker
 */
exports.create =  function (req, res, next) {
  //AN EXAMPLE OF HOW IT COULD BE
  var data = req.body;
  var newMarker = new Marker(data);

  newMarker.save(function(marker, err) {
      if(err) {
          return validationError(res);
      }
      res.json({marker});
  });
}


/**
 * Get all Markers
 */
exports.all = function (req, res, next) {
    //Marker.find...
}

/**
 * Deletes a Marker
 */
exports.destroy = function (req, res) {
    
}