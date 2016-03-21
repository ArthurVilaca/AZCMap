'use strict';

var Marker = require('./marker.model');
var requestPromise = require('request-promise');

//Use this for logic validation errors
function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json({ error: err });
  }
}

//Use this to handle errors (in catches)
function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send({ error: err });
  };
}

function respondWith(res, statusCode) {
  statusCode = statusCode || 200;
  return function () {
    res.status(statusCode).end();
  };
}

/**
 * Creates a new Marker
 */
exports.create = function (req, res, next) {
  var data = req.body;
  var marker = new Marker(data);
  marker.creatorIp = req.clientIp;

  create(marker, data).then(() => {
    res.json({ data: marker.public });
  }).catch(validationError(res));
};

function create(marker, data) {
  return new Promise((resolve, reject) => {
    if (!data.location) {
      var options = {
        uri: 'http://freegeoip.net/json/' + marker.creatorIp,
        json: true
      };
      requestPromise(options)
        .then((userLocation) => {
          console.log(userLocation);
          if (userLocation.longitude !== 0 && userLocation.latitude !== 0) {
            marker.creatorLocation = {
              type: 'Point',
              coordinates: [userLocation.longitude, userLocation.latitude]
            };
          }
          
          resolve(marker.save())
        })
        .catch((err) => {
          console.log(err);
          //Will ignore that could not get the user location and save anyway
          resolve(marker.save());
        });
    } else {
      resolve(marker.save());
    }
  });
}

/**
 * Get all Markers
 */
exports.all = function (req, res, next) {
  //TODO: find according to the parameters
  Marker.find()
    .then((markers) => {
      res.json({ data: markers.public });
    })
    .catch(handleError(res));
};

/**
 * Deletes a Marker
 */
exports.destroy = function (req, res) {
  handleError(res, 403)(new Error('Delete function not yet available.'));
};