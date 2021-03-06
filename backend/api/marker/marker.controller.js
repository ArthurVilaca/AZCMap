'use strict';

var Marker = require('./marker.model');
var requestPromise = require('request-promise');
var BaseController = require('../../interface/baseController');
var profanityUtil = require('profanity-util');

const PURIFYING_LANGUAGES = ['pt', 'en'];
// Will use the same replacement every time
const PURIFYING_REPLACEMENTS = ['?#@*&%!'];

class MarkerController extends BaseController {

  /**
  * Creates a new Marker
  */
  create(req, res, next) {
    var data = req.body;
    var marker = new Marker(data);
    marker.creatorIp = req.clientIp;
    this.purifyMarker(marker)
      .then(() => {
        return this._create(marker, data)
          .then(() => {
            return res.json({ marker: marker.public });
          });
      })
      .catch(this.validationError(res));
  }
  
  purifyMarker (marker) {
    return profanityUtil.purifyAsync(marker.description, { languages: PURIFYING_LANGUAGES, replace: true, replacementsList: PURIFYING_REPLACEMENTS })
      .then(purifiedResult => {
        marker.description = purifiedResult[0];
      });
  }

  _create(marker, data) {
    return new Promise((resolve, reject) => {
      if (!data.creatorLocation) {
        this._createCheckingIp(marker, data)
          .then(savedMarker => {
            resolve(savedMarker);
          })
          .catch(err => {
            console.log(err);
            //Will ignore the fact that we could not get the user location and save the marker anyway
            resolve(marker.save());
          });
      } else {
        marker.save()
          .then(savedMarker => {
            resolve(savedMarker);
          })
          .catch(err => {
            reject(err);
          });
      }
    });
  }

  _createCheckingIp(marker, data) {
    var options = {
      uri: 'http://freegeoip.net/json/' + marker.creatorIp,
      json: true
    };

    return requestPromise(options)
      .then(userLocation => {
        console.log(userLocation);
        if (userLocation.longitude !== 0 && userLocation.latitude !== 0) {
          marker.creatorLocation = {
            type: 'Point',
            coordinates: [userLocation.longitude, userLocation.latitude]
          };
        }

        return marker.save();
      });
  }

  /**
  * Get all Markers
  */
  all(req, res, next) {
    //TODO: find according to query parameters
    Marker.find()
      .then((markers) => {
        res.json({ markers: markers.map(marker => marker.public) });
      })
      .catch(this.handleError(res));
  }
  
  /**
  * Deletes a Marker
  */
  destroy(req, res) {
    this.handleError(res, 403)(new Error('Delete function not yet available.'));
  }
  
}

module.exports = MarkerController;
